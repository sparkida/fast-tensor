import fs from 'fs';
import path from 'path';
import { Renderer, Converter, ReflectionKind } from 'typedoc';

export function load(app) {
  app.converter.on(Converter.EVENT_RESOLVE, (context, reflection) => {
    // Register custom @broadcast tag
    if (reflection.comment && reflection.comment.blockTags) {
      const broadcastTag = reflection.comment.blockTags.find(tag => tag.tag === '@broadcast');
      if (broadcastTag) {
        reflection.broadcast = true;
      }
    }
  });

  app.renderer.on(Renderer.EVENT_END, (context) => {
    console.log('[CleanTheme Plugin] Renderer Prepare Index Triggered');

    const project = context.project;
    const outputDir = path.join(context.outputDirectory, 'classes');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const reflection of Object.values(project.reflections)) {
      if (reflection.kind === ReflectionKind.Class && reflection.children) {
        console.log(`[CleanTheme Plugin] Processing class: ${reflection.name}`);

        let categoryMap = new Map();
        const uncategorizedMembers = [];

        // Group members by @category
        reflection.children.forEach(child => {
          /** TODO handle properties
          if (child.name === 'cols') {
            console.log(child);
          }
          */
          let category = 'Uncategorized';

          if (child.signatures?.[0]?.comment?.blockTags) {
            const categoryTag = child.signatures[0].comment.blockTags.find(tag => tag.tag === '@category');
            if (categoryTag && categoryTag.content?.length > 0) {
              category = categoryTag.content.map(part => part.text.trim()).join(' ');
            }
          }

          if (category === 'Uncategorized') {
            uncategorizedMembers.push(child);
          } else {
            if (!categoryMap.has(category)) {
              categoryMap.set(category, []);
            }
            categoryMap.get(category).push(child);
          }
        });

        categoryMap = new Map([...categoryMap.entries()].sort());

        // Helper Functions
        const formatParameters = (parameters) => {
          return parameters?.map(p => {
            let typeRepresentation = p.type?.toString() || 'unknown';

            if (p.type?.type === 'reference' && p.type?.name) {
              const targetReflection = project.getChildByName(p.type.name);
              if (targetReflection && targetReflection.url) {
                typeRepresentation = `[${p.type.name}](/${targetReflection.url})`;
              }
            }

            return `${p.name}: ${typeRepresentation}`;
          }).join(', ') || '';
        };

        const formatExamples = (comment) => {
          const exampleTags = comment?.blockTags?.filter(tag => tag.tag === '@example');
          if (!exampleTags || exampleTags.length === 0) return '';
          return exampleTags.map(example => {
            return `\n\n${example.content.map(c => c.text).join('')}\n`;
          }).join('\n\n');
        };

        const addCommentText = (comment) => {
          let text = comment?.summary?.[0]?.text ?? '';
          const supportsBroadcasting = comment?.blockTags?.find(tag => tag.tag === '@broadcast');
          if (text && !text.endsWith('.')) {
            text = `${text}.`;
          }
          if (supportsBroadcasting) {
            text += ' Supports broadcasting.';
          }
          return text ? `${text}\n` : '';
        };

        // Generate Single Class File
        const classFilePath = path.join(outputDir, `${reflection.name}.md`);
        let classContent = `# ${reflection.name}\n\n`;

        // Add Overview (if available)
        if (reflection.comment?.summary?.length > 0) {
          classContent += `${reflection.comment.summary.map(c => c.text).join(' ').trim()}\n\n`;
        }

        // Add Uncategorized Members
        if (uncategorizedMembers.length > 0) {
          //classContent += `## Uncategorized\n\n`;

          uncategorizedMembers.forEach(member => {
            classContent += `### ${member.name}\n`;

            if (member.signatures) {
              member.signatures.forEach(signature => {
                classContent += `${addCommentText(signature.comment)}\n`;
                const params = formatParameters(signature.parameters || []);
                classContent += `<code>${signature.name}(${params})</code> → \`${signature.type || 'void'}\`\n`;
                classContent += `${formatExamples(signature.comment)}\n`;
              });
            }
            if (member.sources) {
              classContent += `<small>[source](${member.sources[0].url})</small>\n`;
            }
            classContent += `\n`;
          });
        }

        // Iterate Over Categories
        categoryMap.forEach((members, category) => {
          classContent += `## ${category}\n\n`;

          members.forEach(member => {
            classContent += `### ${member.name}\n`;

            if (member.signatures) {
              member.signatures.forEach(signature => {
                classContent += `${addCommentText(signature.comment)}\n`;
                const params = formatParameters(signature.parameters || []);
                classContent += `<code>${signature.name}(${params})</code> → \`${signature.type || 'void'}\`\n`;
                classContent += `${formatExamples(signature.comment)}\n`;
              });
            }
            if (member.sources) {
              classContent += `<small>[source](${member.sources[0].url})</small>\n`;
            }
            classContent += `\n`;
          });
        });

        // Write Single File
        fs.writeFileSync(classFilePath, classContent, 'utf8');
        console.log(`[CleanTheme Plugin] Generated ${classFilePath}`);
      }
    }
  });
}

