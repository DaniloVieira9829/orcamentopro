#!/bin/bash

# Script de deploy para OrçamentoPro
echo "🚀 Iniciando deploy do OrçamentoPro..."

# Verifica se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo "📝 Há mudanças não commitadas. Fazendo commit automático..."
    git add .
    git commit -m "deploy: automatic deployment $(date)"
fi

# Faz push para o repositório
echo "📤 Enviando para o GitHub..."
git push origin main

echo "✅ Deploy iniciado! Verifique o GitHub Actions para acompanhar."
echo "🌐 Seu site estará disponível em: https://SEU_USUARIO.github.io/orcamentopro"
