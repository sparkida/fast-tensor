# Docker environment
DOCKERENV := DUID=$(shell id -u) DGID=$(shell id -g)

# Build command
BUILD := $(DOCKERENV) docker-compose run --rm emsdk emcc

# Optimization flags
OPTIMIZATION ?= -O3

# Precision
PRECISION ?= 32
ifeq ($(PRECISION), 64)
	PRECISION_FLAG := -DUSE_DOUBLE
else
	PRECISION_FLAG :=
endif

# Common flags
CXXFLAGS := -std=c++17 \
	-fno-rtti \
	-Wno-nan-infinity-disabled \
	-fdiagnostics-color=always \
	$(OPTIMIZATION) \
	$(PRECISION_FLAG)

# Exceptions
EXCEPTIONS ?= 0
ifeq ($(EXCEPTIONS), 1)
	WEXCEPTIONS := -sDISABLE_EXCEPTION_CATCHING=0 -fexceptions
else
	WEXCEPTIONS :=
endif

EMCCFLAGS := -s MODULARIZE=1 \
	-s FILESYSTEM=0 \
	--closure 0

# Combined flags
FLAGS := $(CXXFLAGS) $(EMCCFLAGS) $(WEXCEPTIONS)

# Paths and directories
ROOT := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SRC_DIR := $(ROOT)/src/cpp
BIND_DIR := $(ROOT)/src/wasm
DIST_DIR := $(ROOT)/dist

# Sources
SOURCES := Tensor.cpp Kalman.cpp Bindings.cpp
OUTPUT := tensor

# Ensure output directory exists
$(DIST_DIR):
	mkdir -p $(DIST_DIR)

.PHONY: all
all: clean web node dev rollup

#--pre-js dynamic-resolver.js \

.PHONY: web
web: $(DIST_DIR)
	cd $(SRC_DIR) && \
		$(BUILD) $(FLAGS) -s ENVIRONMENT=web \
		-s EXPORTED_FUNCTIONS="$(shell node build-exports.mjs)" \
		-s EXPORT_ES6=1 \
		-o $(OUTPUT).js $(SOURCES) && \
		mv $(OUTPUT).wasm $(DIST_DIR)/ && \
		mv $(OUTPUT).js $(BIND_DIR)/$(OUTPUT).esm.js && \
		echo '---Web ESM build complete---'

.PHONY: node
node: $(DIST_DIR)
	cd $(SRC_DIR) && \
		$(BUILD) $(FLAGS) -s ENVIRONMENT=node \
		-s EXPORTED_FUNCTIONS="$(shell node build-exports.mjs)" \
		-s EXPORT_ES6=1 \
		-o $(OUTPUT).js $(SOURCES) && \
		mv $(OUTPUT).wasm $(DIST_DIR)/ && \
		mv $(OUTPUT).js $(BIND_DIR)/$(OUTPUT).node.esm.js && \
		echo '---Node ESM build complete---'

.PHONY: dev
dev:
	cd $(SRC_DIR) && \
		$(BUILD) $(EMCCFLAGS) -s ENVIRONMENT=node \
		-s EXPORTED_FUNCTIONS="$(shell node build-exports.mjs)" \
		-s DISABLE_EXCEPTION_CATCHING=0 -fexceptions \
		-s EXPORT_ES6=1 \
		-o $(OUTPUT).dev.js $(SOURCES) && \
		mv $(OUTPUT).dev.wasm $(BIND_DIR)/ && \
		mv $(OUTPUT).dev.js $(BIND_DIR)/ && \
		echo '---Node Dev build complete---'

.PHONY: rollup
rollup: $(DIST_DIR)
	npx rollup -c

.PHONY: clean
clean:
	rm -rf $(DIST_DIR)

# Help target
.PHONY: help
help:
	@echo "Usage: make [target] [OPTION=VALUE]"
	@echo ""
	@echo "Targets:"
	@echo "  all            Build for both web and node environments"
	@echo "  web            Build for web environment"
	@echo "  node           Build for node environment"
	@echo "  clean          Clean the build artifacts"
	@echo "  help           Show this help message"
	@echo ""
	@echo "Options:"
	@echo "  OPTIMIZATION   Set optimization level (default: -O3)"
	@echo "  PRECISION      Set floating-point precision: 32 (default) or 64"
	@echo "  EXCEPTIONS     Enable exception handling: 0 (default) or 1"

