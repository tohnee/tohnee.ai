#!/bin/bash
# Batch generate images for tohnee.ai website - Using 1K for faster generation

export GEMINI_API_KEY="AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU"
SCRIPT="/Users/tc/.local/share/fnm/node-versions/v24.13.0/installation/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"
OUTPUT_DIR="/Users/tc/Workspace/tohnee.ai/public/images"

mkdir -p "$OUTPUT_DIR"

echo "Generating images for tohnee.ai (1K resolution for speed)..."

# Generate one by one with retry logic
generate_image() {
    local name=$1
    local prompt=$2
    local filename=$3
    
    echo "Generating: $name"
    uv run --with google-genai --with pillow python "$SCRIPT" \
        --prompt "$prompt" \
        --filename "$filename" \
        --resolution 1K 2>&1
    
    if [ -f "$filename" ]; then
        echo "✓ Success: $name"
    else
        echo "✗ Failed: $name"
    fi
}

# Home page images
generate_image "Home Research" \
    "Abstract visualization of sparse autoencoders neural network, minimal scientific illustration, clean white background blue purple accents, modern tech" \
    "$OUTPUT_DIR/home-research.png"

generate_image "Home Org" \
    "Modern minimalist office architecture glass concrete, abstract team structure, black white photography style" \
    "$OUTPUT_DIR/home-org.png"

generate_image "Home Agents" \
    "Abstract geometric shapes AI agents blue purple gradients clean high tech 3D render" \
    "$OUTPUT_DIR/home-agents.png"

generate_image "Home OPC" \
    "Person futuristic dashboard commanding drones minimalist tech cinematic" \
    "$OUTPUT_DIR/home-opc.png"

generate_image "Home AGI" \
    "AGI neural network brain glowing synapses dark cyberpunk futuristic" \
    "$OUTPUT_DIR/home-agi.png"

# Article images
generate_image "Article Sparse" \
    "Sparse autoencoders diagram neural nodes minimalist scientific white blue" \
    "$OUTPUT_DIR/article-sparse.png"

generate_image "Article Scaling" \
    "Exponential growth graph human network minimalist infographic clean" \
    "$OUTPUT_DIR/article-scaling.png"

# Agent images
generate_image "Agent Dev" \
    "Futuristic holographic code interface dark cyan neon software engineering" \
    "$OUTPUT_DIR/agent-dev.png"

generate_image "Agent Research" \
    "Abstract data knowledge network white silver clean scientific" \
    "$OUTPUT_DIR/agent-research.png"

generate_image "Agent Design" \
    "Creative studio workspace generative art colorful abstract modern design" \
    "$OUTPUT_DIR/agent-design.png"

echo "Done! Generated images:"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "No images found"
