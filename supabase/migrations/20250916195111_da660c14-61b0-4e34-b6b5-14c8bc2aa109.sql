-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_produto TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  link_imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de condimentos
CREATE TABLE public.condimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_condimento TEXT NOT NULL UNIQUE,
  nome_condimento TEXT NOT NULL,
  valor_adicional DECIMAL(10,2) NOT NULL DEFAULT 0,
  link_imagem TEXT,
  tipo_condimento TEXT NOT NULL CHECK (tipo_condimento IN ('Bordas', 'Adicionais')),
  selecao_multipla TEXT NOT NULL CHECK (selecao_multipla IN ('sim', 'não')) DEFAULT 'sim',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de associação produto-condimento
CREATE TABLE public.associacao_produto_condimento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_produto TEXT NOT NULL REFERENCES public.produtos(id_produto) ON DELETE CASCADE,
  id_condimento TEXT NOT NULL REFERENCES public.condimentos(id_condimento) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(id_produto, id_condimento)
);

-- Criar tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_pedido TEXT NOT NULL UNIQUE,
  nome_usuario TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  telefone TEXT NOT NULL,
  tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'PIX')),
  carrinho TEXT NOT NULL UNIQUE,
  data_pedido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  aprovado TEXT NOT NULL CHECK (aprovado IN ('sim', 'não', '')) DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos vendidos
CREATE TABLE public.produtos_vendidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_produtos_vendidos TEXT NOT NULL,
  id_pedido TEXT NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
  id_produto TEXT NOT NULL,
  id_condimento TEXT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  condimentos_selecionados TEXT,
  valor_condimentos DECIMAL(10,2) NOT NULL DEFAULT 0,
  nome_usuario TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  telefone TEXT NOT NULL,
  tipo_pagamento TEXT NOT NULL,
  carrinho TEXT NOT NULL REFERENCES public.pedidos(carrinho) ON DELETE CASCADE,
  data_pedido TIMESTAMP WITH TIME ZONE NOT NULL,
  aprovado TEXT NOT NULL CHECK (aprovado IN ('sim', 'não')) DEFAULT 'não',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associacao_produto_condimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_vendidos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos (acesso público para leitura)
CREATE POLICY "Produtos são visíveis para todos" 
ON public.produtos 
FOR SELECT 
USING (true);

-- Políticas RLS para condimentos (acesso público para leitura)
CREATE POLICY "Condimentos são visíveis para todos" 
ON public.condimentos 
FOR SELECT 
USING (true);

-- Políticas RLS para associação produto-condimento (acesso público para leitura)
CREATE POLICY "Associações são visíveis para todos" 
ON public.associacao_produto_condimento 
FOR SELECT 
USING (true);

-- Políticas RLS para pedidos (acesso público para inserção e leitura específica)
CREATE POLICY "Qualquer um pode criar pedidos" 
ON public.pedidos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Pedidos são visíveis por código do carrinho" 
ON public.pedidos 
FOR SELECT 
USING (true);

CREATE POLICY "Pedidos podem ser atualizados" 
ON public.pedidos 
FOR UPDATE 
USING (true);

-- Políticas RLS para produtos vendidos (acesso público para inserção e leitura)
CREATE POLICY "Qualquer um pode criar produtos vendidos" 
ON public.produtos_vendidos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Produtos vendidos são visíveis para todos" 
ON public.produtos_vendidos 
FOR SELECT 
USING (true);

CREATE POLICY "Produtos vendidos podem ser atualizados" 
ON public.produtos_vendidos 
FOR UPDATE 
USING (true);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar triggers para atualização automática de updated_at
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_condimentos_updated_at
  BEFORE UPDATE ON public.condimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_vendidos_updated_at
  BEFORE UPDATE ON public.produtos_vendidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX idx_produtos_id_produto ON public.produtos(id_produto);
CREATE INDEX idx_condimentos_tipo ON public.condimentos(tipo_condimento);
CREATE INDEX idx_condimentos_id_condimento ON public.condimentos(id_condimento);
CREATE INDEX idx_associacao_id_produto ON public.associacao_produto_condimento(id_produto);
CREATE INDEX idx_associacao_id_condimento ON public.associacao_produto_condimento(id_condimento);
CREATE INDEX idx_pedidos_carrinho ON public.pedidos(carrinho);
CREATE INDEX idx_pedidos_id_pedido ON public.pedidos(id_pedido);
CREATE INDEX idx_produtos_vendidos_carrinho ON public.produtos_vendidos(carrinho);
CREATE INDEX idx_produtos_vendidos_id_pedido ON public.produtos_vendidos(id_pedido);