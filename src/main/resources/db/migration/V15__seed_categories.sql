INSERT INTO categories (id, name, slug, icon, description) VALUES
(gen_random_uuid(), 'Desenvolvimento & TI', 'desenvolvimento-ti', '💻', 'Sites, sistemas, APIs, DevOps e mais'),
(gen_random_uuid(), 'Design & Criativo', 'design-criativo', '🎨', 'Design gráfico, UI/UX, identidade visual e mais'),
(gen_random_uuid(), 'Marketing & Vendas', 'marketing-vendas', '📈', 'Tráfego pago, SEO, redes sociais e mais'),
(gen_random_uuid(), 'Redação & Tradução', 'redacao-traducao', '✍️', 'Artigos, copywriting, traduções e mais'),
(gen_random_uuid(), 'Administração & Suporte', 'administracao-suporte', '🗂️', 'Assistente virtual, suporte, RH e mais'),
(gen_random_uuid(), 'Finanças & Contabilidade', 'financas-contabilidade', '💰', 'Contabilidade, consultoria financeira e mais'),
(gen_random_uuid(), 'Engenharia & Arquitetura', 'engenharia-arquitetura', '🏗️', 'Projetos, estruturas, engenharia e mais'),
(gen_random_uuid(), 'Dados & Analytics', 'dados-analytics', '📊', 'Análise de dados, BI, dashboards e mais'),
(gen_random_uuid(), 'IA & Machine Learning', 'ia-machine-learning', '🤖', 'Modelos, automações, LLMs e mais'),
(gen_random_uuid(), 'Áudio & Vídeo', 'audio-video', '🎬', 'Edição, produção, locução e mais'),
(gen_random_uuid(), 'Mobile Development', 'mobile-development', '📱', 'Apps Android, iOS, React Native e mais'),
(gen_random_uuid(), 'Games', 'games', '🎮', 'Desenvolvimento de jogos, arte e mais'),
(gen_random_uuid(), 'Consultoria', 'consultoria', '🎯', 'Consultoria de negócios, estratégia e mais'),
(gen_random_uuid(), 'Jurídico', 'juridico', '⚖️', 'Consultoria jurídica, contratos e mais');

-- Especialidades: Desenvolvimento & TI
WITH cat AS (SELECT id FROM categories WHERE slug = 'desenvolvimento-ti')
INSERT INTO specialties (category_id, name, slug)
SELECT cat.id, esp.name, esp.slug FROM cat,
(VALUES
  ('Desenvolvimento Web', 'desenvolvimento-web'),
  ('API & Integrações', 'api-integracoes'),
  ('Spring Boot', 'spring-boot'),
  ('React', 'react'),
  ('Java', 'java'),
  ('Node.js', 'nodejs'),
  ('Python', 'python'),
  ('PostgreSQL', 'postgresql'),
  ('Docker & DevOps', 'docker-devops'),
  ('Cloud AWS/GCP/Azure', 'cloud'),
  ('TypeScript', 'typescript'),
  ('Next.js', 'nextjs')
) AS esp(name, slug);

-- Especialidades: Design & Criativo
WITH cat AS (SELECT id FROM categories WHERE slug = 'design-criativo')
INSERT INTO specialties (category_id, name, slug)
SELECT cat.id, esp.name, esp.slug FROM cat,
(VALUES
  ('UI/UX Design', 'ui-ux'),
  ('Design Gráfico', 'design-grafico'),
  ('Identidade Visual', 'identidade-visual'),
  ('Figma', 'figma'),
  ('Ilustração', 'ilustracao'),
  ('Motion Design', 'motion-design'),
  ('Design de Produto', 'design-produto')
) AS esp(name, slug);

-- Especialidades: Marketing & Vendas
WITH cat AS (SELECT id FROM categories WHERE slug = 'marketing-vendas')
INSERT INTO specialties (category_id, name, slug)
SELECT cat.id, esp.name, esp.slug FROM cat,
(VALUES
  ('SEO', 'seo'),
  ('Google Ads', 'google-ads'),
  ('Meta Ads', 'meta-ads'),
  ('Email Marketing', 'email-marketing'),
  ('Gestão de Redes Sociais', 'redes-sociais'),
  ('Copywriting', 'copywriting'),
  ('Marketing de Conteúdo', 'marketing-conteudo')
) AS esp(name, slug);

-- Especialidades: Mobile
WITH cat AS (SELECT id FROM categories WHERE slug = 'mobile-development')
INSERT INTO specialties (category_id, name, slug)
SELECT cat.id, esp.name, esp.slug FROM cat,
(VALUES
  ('Android (Kotlin)', 'android-kotlin'),
  ('iOS (Swift)', 'ios-swift'),
  ('React Native', 'react-native'),
  ('Flutter', 'flutter'),
  ('Ionic', 'ionic')
) AS esp(name, slug);

-- Especialidades: Dados & Analytics
WITH cat AS (SELECT id FROM categories WHERE slug = 'dados-analytics')
INSERT INTO specialties (category_id, name, slug)
SELECT cat.id, esp.name, esp.slug FROM cat,
(VALUES
  ('Power BI', 'power-bi'),
  ('Tableau', 'tableau'),
  ('SQL Avançado', 'sql-avancado'),
  ('ETL & Pipelines', 'etl'),
  ('Data Science', 'data-science'),
  ('Python para Dados', 'python-dados')
) AS esp(name, slug);

-- Especialidades: IA & ML
WITH cat AS (SELECT id FROM categories WHERE slug = 'ia-machine-learning')
INSERT INTO specialties (category_id, name, slug)
SELECT cat.id, esp.name, esp.slug FROM cat,
(VALUES
  ('Machine Learning', 'machine-learning'),
  ('Deep Learning', 'deep-learning'),
  ('LLMs & ChatGPT', 'llms'),
  ('Computer Vision', 'computer-vision'),
  ('Automações com IA', 'automacoes-ia'),
  ('NLP', 'nlp')
) AS esp(name, slug);
