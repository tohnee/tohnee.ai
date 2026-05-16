#!/bin/bash
# Batch generate images for tohnee.ai website

export GEMINI_API_KEY="REDACTED_GEMINI_API_KEY"
SCRIPT="/Users/tc/.local/share/fnm/node-versions/v24.13.0/installation/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"
OUTPUT_DIR="/Users/tc/Workspace/tohnee.ai/public/images"

mkdir -p "$OUTPUT_DIR"

echo "Generating images for tohnee.ai..."

# Home page images
echo "1/10 - Home Research (Sparse Autoencoders)..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Abstract visualization of sparse autoencoders and neural network weights, minimal scientific illustration, clean white background with blue and purple geometric accents, high detail, modern tech aesthetic, 3D render" \
  --filename "$OUTPUT_DIR/home-research-sparse-autoencoders.png" \
  --resolution 2K

echo "2/10 - Home Organization (Office Architecture)..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Modern minimalist office building architecture, glass and concrete, abstract representation of team structure, black and white photography style, clean geometric lines, professional" \
  --filename "$OUTPUT_DIR/home-org-structure.png" \
  --resolution 2K

echo "3/10 - Home Agents (Autonomous Agents)..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Abstract geometric shapes representing autonomous AI agents, blue and purple gradients, clean high-tech aesthetic, 3D render, futuristic digital art" \
  --filename "$OUTPUT_DIR/home-agents-safety.png" \
  --resolution 2K

echo "4/10 - Home OPC (One Person Company)..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "One person standing in front of futuristic command dashboard, controlling fleet of drones, minimalist line art, tech aesthetic, cinematic lighting, clean modern design" \
  --filename "$OUTPUT_DIR/home-opc.png" \
  --resolution 2K

echo "5/10 - Home AGI Research..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Abstract visualization of AGI artificial general intelligence, neural network brain with glowing synapses, dark background, cyberpunk aesthetic, 8k resolution, futuristic" \
  --filename "$OUTPUT_DIR/home-agi-research.png" \
  --resolution 2K

# Article images
echo "6/10 - Article Sparse Autoencoders..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Sparse autoencoders technical diagram, neural network nodes and connections, minimalist scientific illustration, white background with blue accents, clean educational style" \
  --filename "$OUTPUT_DIR/article-sparse-autoencoders.png" \
  --resolution 2K

echo "7/10 - Article Scaling Laws..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Exponential growth graph with single human silhouette connected to global network, minimalist infographic, clean lines, white background, professional business illustration" \
  --filename "$OUTPUT_DIR/article-scaling-laws.png" \
  --resolution 2K

# Agent images
echo "8/10 - Agent Dev-01..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Futuristic holographic interface showing code and system architecture, dark mode with cyan and neon accents, highly detailed, software engineering visualization, cyberpunk" \
  --filename "$OUTPUT_DIR/agent-dev-01.png" \
  --resolution 2K

echo "9/10 - Agent Research-01..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Abstract data visualization, network of knowledge connecting dots, white and silver color scheme, clean scientific research aesthetic, minimal modern design" \
  --filename "$OUTPUT_DIR/agent-research-01.png" \
  --resolution 2K

echo "10/10 - Agent Design-01..."
uv run --with google-genai --with pillow python "$SCRIPT" \
  --prompt "Creative studio workspace with generative art on screens, colorful abstract shapes, modern design aesthetic, bright professional creative environment" \
  --filename "$OUTPUT_DIR/agent-design-01.png" \
  --resolution 2K

echo "All images generated!"
ls -la "$OUTPUT_DIR"/*.png
