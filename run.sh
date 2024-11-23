
#!/bin/bash
if ! command -v dot-minify &> /dev/null; then
    wget -O "dot-minify" https://github.com/cxumol/dot-minify/releases/download/latest/dot-minify-x86_64-linux-musl || wget https://github.com/cxumol/dot-minify/releases/download/latest/dot-minify
    chmod +x "dot-minify" && mkdir -p ~/.local/bin/ && mv "dot-minify" ~/.local/bin/
fi

node --experimental-default-type=module --env-file=.env main.js
echo exit...