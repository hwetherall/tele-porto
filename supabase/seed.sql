-- ============================================================
-- Tele-Porto Seed Data
-- Idempotent — safe to re-run (uses ON CONFLICT DO NOTHING)
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

insert into users (name, xp, level, streak_count, journey_stage) values
  ('Harry', 0, 1, 0, 1),
  ('Ky',  0, 1, 0, 1)
on conflict (name) do nothing;

-- ============================================================
-- PHRASES — Big Five Verbs
-- ============================================================

insert into phrases (portuguese, english, category) values
  -- ESTAR
  ('Eu estou bem',                    'I am fine',                        'big_five'),
  ('Você está bem?',                   'Are you okay?',                    'big_five'),
  ('Ele está cansado',                 'He is tired',                      'big_five'),
  ('Ela está cansada',                 'She is tired',                     'big_five'),
  ('Nós estamos prontos',              'We are ready',                     'big_five'),
  ('As crianças estão dormindo',       'The children are sleeping',        'big_five'),
  ('Eu estou aprendendo português',    'I am learning Portuguese',         'big_five'),
  ('Tudo está ótimo',                  'Everything is great',              'big_five'),
  ('Onde você está?',                  'Where are you?',                   'big_five'),
  ('Estou no trabalho',                'I am at work',                     'big_five'),
  ('Como você está?',                  'How are you?',                     'big_five'),
  -- IR
  ('Vou ao trabalho',                  'I''m going to work',               'big_five'),
  ('Você vai para casa?',              'Are you going home?',              'big_five'),
  ('Vamos almoçar juntos?',            'Shall we have lunch together?',    'big_five'),
  ('Ela vai buscar as crianças',       'She is going to pick up the kids', 'big_five'),
  ('Para onde você vai?',              'Where are you going?',             'big_five'),
  ('Vou voltar mais tarde',            'I''ll be back later',              'big_five'),
  ('Vai ser ótimo!',                   'It''s going to be great!',         'big_five'),
  ('Vamos!',                           'Let''s go!',                       'big_five'),
  -- TER
  ('Eu tenho uma reunião',             'I have a meeting',                 'big_five'),
  ('Você tem tempo?',                  'Do you have time?',                'big_five'),
  ('As crianças têm fome',             'The children are hungry',          'big_five'),
  ('Tenho que ir',                     'I have to go',                     'big_five'),
  ('Você tem filhos?',                 'Do you have children?',            'big_five'),
  ('Não tenho certeza',                'I''m not sure',                    'big_five'),
  ('Temos muito para fazer',           'We have a lot to do',              'big_five'),
  -- QUERER
  ('O que você quer?',                 'What do you want?',                'big_five'),
  ('Eu quero praticar português',      'I want to practice Portuguese',    'big_five'),
  ('Você quer um café?',               'Do you want a coffee?',            'big_five'),
  ('Queremos ir à praia',              'We want to go to the beach',       'big_five'),
  ('Não quero ser rude',               'I don''t want to be rude',         'big_five'),
  ('O que as crianças querem?',        'What do the children want?',       'big_five'),
  ('Eu quero aprender mais',           'I want to learn more',             'big_five'),
  -- FAZER
  ('O que você vai fazer hoje?',       'What are you going to do today?',  'big_five'),
  ('Eu faço isso agora',               'I''ll do that now',                'big_five'),
  ('O que estamos fazendo?',           'What are we doing?',               'big_five'),
  ('Pode fazer isso para mim?',        'Can you do that for me?',          'big_five'),
  ('Fizemos um bom trabalho',          'We did a good job',                'big_five'),
  ('O que ela vai fazer?',             'What is she going to do?',         'big_five'),
  ('Faça como quiser',                 'Do as you like',                   'big_five')
on conflict do nothing;

-- ============================================================
-- PHRASES — Household / Mychelle
-- ============================================================

insert into phrases (portuguese, english, category) values
  ('Bom dia, Mychelle!',                   'Good morning, Mychelle!',                  'household'),
  ('Como foi o dia?',                       'How was the day?',                         'household'),
  ('As crianças comeram bem?',              'Did the kids eat well?',                   'household'),
  ('Pode ficar mais uma hora?',             'Can you stay an extra hour?',              'household'),
  ('Obrigado por tudo hoje',                'Thank you for everything today',           'household'),
  ('A que horas você chega amanhã?',        'What time do you arrive tomorrow?',        'household'),
  ('As crianças precisam de banho',         'The kids need a bath',                     'household'),
  ('Eles já almoçaram',                     'They already had lunch',                   'household'),
  ('Pode levar as crianças ao parque?',     'Can you take the kids to the park?',       'household'),
  ('Eles estão dormindo?',                  'Are they sleeping?',                       'household'),
  ('O bebê estava chorando',                'The baby was crying',                      'household'),
  ('Tivemos um dia ótimo!',                 'We had a great day!',                      'household'),
  ('Você precisa de alguma coisa?',         'Do you need anything?',                    'household'),
  ('Deixei o lanche na geladeira',          'I left the snack in the fridge',           'household'),
  ('Ele tem aula às três',                  'He has class at three',                    'household'),
  ('Elas foram ao parque hoje',             'They went to the park today',              'household'),
  ('Por favor, ligue para mim se precisar', 'Please call me if you need anything',      'household'),
  ('Que bom que você está aqui!',           'It''s great that you''re here!',           'household'),
  ('Até amanhã!',                           'See you tomorrow!',                        'household'),
  ('O que as crianças vão fazer hoje?',     'What are the children going to do today?', 'household')
on conflict do nothing;

-- ============================================================
-- PHRASES — Work / Felipe
-- ============================================================

insert into phrases (portuguese, english, category) values
  ('Tudo bem?',                       'How''s everything? / All good?',   'work'),
  ('Como foi o fim de semana?',        'How was the weekend?',             'work'),
  ('Pronto para a reunião?',           'Ready for the meeting?',           'work'),
  ('Tem um minuto?',                   'Do you have a minute?',            'work'),
  ('Você viu o email?',                'Did you see the email?',           'work'),
  ('O projeto está indo bem',          'The project is going well',        'work'),
  ('Preciso da sua ajuda',             'I need your help',                 'work'),
  ('Quando você pode?',                'When can you meet/talk?',          'work'),
  ('Muito bom trabalho!',              'Very good work!',                  'work'),
  ('O que você acha?',                 'What do you think?',               'work'),
  ('Vamos agendar uma call?',          'Shall we schedule a call?',        'work'),
  ('Obrigado pela ajuda',              'Thanks for the help',              'work'),
  ('Pode me mandar isso por email?',   'Can you send me that by email?',   'work'),
  ('Estamos no prazo',                 'We''re on schedule',               'work'),
  ('Isso faz sentido',                 'That makes sense',                 'work')
on conflict do nothing;

-- ============================================================
-- PHRASES — Wedding / Ericeira
-- ============================================================

insert into phrases (portuguese, english, category) values
  ('Que festa linda!',                    'What a beautiful party!',            'wedding'),
  ('Você conhece os noivos?',              'Do you know the couple?',            'wedding'),
  ('Saúde!',                               'Cheers!',                            'wedding'),
  ('Posso te apresentar...',               'Can I introduce you to...',          'wedding'),
  ('É um prazer conhecer você',            'It''s a pleasure to meet you',       'wedding'),
  ('Como você conhece os noivos?',         'How do you know the couple?',        'wedding'),
  ('Que lugar incrível!',                  'What an incredible place!',          'wedding'),
  ('Você é de Portugal?',                  'Are you from Portugal?',             'wedding'),
  ('Eu sou da Inglaterra',                 'I''m from England',                  'wedding'),
  ('Um brinde aos noivos!',                'A toast to the couple!',             'wedding'),
  ('Eles fazem um casal lindo',            'They make a beautiful couple',       'wedding'),
  ('A comida está deliciosa!',             'The food is delicious!',             'wedding'),
  ('Pode me trazer um vinho tinto?',       'Can you bring me a red wine?',       'wedding'),
  ('Obrigado, foi uma festa incrível',     'Thank you, it was an incredible party', 'wedding'),
  ('Ericeira é uma cidade maravilhosa',    'Ericeira is a wonderful town',       'wedding')
on conflict do nothing;

-- ============================================================
-- PHRASES — General connectors
-- ============================================================

insert into phrases (portuguese, english, category) values
  ('Por favor',                           'Please',                             'general'),
  ('Obrigado',                            'Thank you (said by a man)',          'general'),
  ('Obrigada',                            'Thank you (said by a woman)',        'general'),
  ('De nada',                             'You''re welcome',                    'general'),
  ('Desculpa',                            'Sorry / Excuse me',                  'general'),
  ('Não entendi',                         'I didn''t understand',               'general'),
  ('Pode repetir?',                       'Can you repeat?',                    'general'),
  ('Mais devagar, por favor',             'Slower, please',                     'general'),
  ('Como se diz...?',                     'How do you say...?',                 'general'),
  ('Eu não sei',                          'I don''t know',                      'general'),
  ('Meu português não é muito bom ainda', 'My Portuguese isn''t very good yet', 'general'),
  ('Você fala inglês?',                   'Do you speak English?',              'general')
on conflict do nothing;

-- ============================================================
-- SCENARIOS
-- ============================================================

insert into scenarios (title, description, pack, unlock_level, system_prompt) values
(
  'Bom dia, Mychelle!',
  'Morning handover — tell Mychelle about the kids'' plans for the day.',
  'household',
  1,
  'You are Mychelle, a warm and patient Brazilian nanny from São Paulo. The user is Harry or Ky, learning Portuguese. They are greeting you at the start of a workday and want to tell you about the kids'' plans.

Respond primarily in Brazilian Portuguese. Keep sentences short and clear. If the user makes a grammatical mistake, gently correct them in English (one sentence max), then continue the conversation in Portuguese.

If the user seems stuck, offer a hint in English like "Try saying: Hoje as crianças vão... (Today the children are going to...)"

Be warm and encouraging. Use casual São Paulo Brazilian Portuguese. Start by greeting them warmly in Portuguese.'
),
(
  'Como foi o dia?',
  'End of day debrief — hear how the day went with the kids.',
  'household',
  1,
  'You are Mychelle, a Brazilian nanny from São Paulo, wrapping up your workday. The user wants to hear how the day went with the kids.

Respond in Brazilian Portuguese. Share a short story about the day — the kids ate lunch well or didn''t, they played at the park, one of them was tired. Keep it conversational.

If the user makes mistakes, briefly correct in English. Encourage them to ask follow-up questions. If they seem stuck, suggest a question they could ask in Portuguese.

Start by greeting them and launching into a brief summary of the day in Portuguese.'
),
(
  'O que você vai fazer no fim de semana?',
  'Friday chat — share weekend plans with Mychelle.',
  'household',
  1,
  'You are Mychelle, a Brazilian nanny from São Paulo. It''s Friday afternoon and the user is chatting about weekend plans.

Respond in Brazilian Portuguese. Talk about what you''re planning to do (visit family, go to the park, cook something nice). Ask what they are planning.

Use ir (to go) and querer (to want) naturally. Gently correct mistakes in English, then return to Portuguese. Keep it light and conversational.'
),
(
  'As crianças estão doentes',
  'One of the kids isn''t well — explain symptoms to Mychelle.',
  'household',
  1,
  'You are Mychelle, a Brazilian nanny from São Paulo. One of the kids is sick and the user needs to explain the situation and ask you to keep an eye on things.

Respond in Brazilian Portuguese. Be sympathetic and professional. Ask clarifying questions about the symptoms. Suggest what to watch for.

Use estar (to be — temporary states) naturally. Correct mistakes gently in English. Offer help phrases if the user seems stuck.'
),
(
  'Obrigado por tudo',
  'Express genuine gratitude to Mychelle at the end of a good week.',
  'household',
  1,
  'You are Mychelle, a Brazilian nanny from São Paulo. The user wants to thank you warmly for a great week.

Respond in Brazilian Portuguese. Be touched and warm. Respond to their thanks graciously, mention something specific about the week that went well.

If the user makes mistakes, gently correct. Help them express heartfelt gratitude in Portuguese.'
),
(
  'Antes da reunião',
  'Pre-meeting small talk with Felipe — five minutes over coffee.',
  'work',
  1,
  'You are Felipe, a Brazilian professional from Salvador, Bahia. You work with Harry and are genuinely happy he''s learning Portuguese. You''re having a quick pre-meeting chat.

Respond in Brazilian Portuguese. Be friendly and professional. If Harry makes mistakes, smile and gently correct in English. Keep the conversation natural — ask about his weekend, mention something about yours.

Use casual Brazilian Portuguese appropriate for a friendly work relationship. Start by greeting Harry warmly.'
),
(
  'Como foi o fim de semana?',
  'Monday morning with Felipe — share what you both got up to.',
  'work',
  1,
  'You are Felipe, a Brazilian professional from Salvador, Bahia. It''s Monday morning and you''re catching up with Harry about the weekend.

Respond in Brazilian Portuguese. Share what you did (visited family, watched football, cooked). Ask what Harry did. Be genuinely curious.

Gently correct mistakes in English. Use ir, ter, fazer naturally in your responses.'
),
(
  'Pode me ajudar?',
  'Ask Felipe for help with something work-related.',
  'work',
  1,
  'You are Felipe, a Brazilian professional from Salvador, Bahia. Harry needs to ask you for help with something at work.

Respond in Brazilian Portuguese. Be helpful and professional. Ask what exactly they need. Offer assistance warmly.

Correct mistakes gently. Help them frame polite work requests in Portuguese.'
),
(
  'Prazer em conhecer!',
  'Meet new people at the reception — introductions and small talk.',
  'wedding',
  3,
  'You are a friendly Portuguese wedding guest at a reception in Ericeira, Portugal. The user is a foreign guest trying to practice Portuguese.

Respond in Portuguese — primarily European Portuguese (Portugal) since this is a wedding in Ericeira. If there are notable differences between European and Brazilian Portuguese in a phrase, briefly mention it (e.g., "In Portugal we say... but in Brazil they say...").

Be warm, curious, and celebratory. Ask where they''re from, how they know the couple, what they think of Portugal. If they struggle, help gently with a hint in English.

Start by introducing yourself warmly in Portuguese.'
),
(
  'Um brinde aos noivos!',
  'Someone hands you the microphone — say a few words for the toast.',
  'wedding',
  3,
  'You are the master of ceremonies at a wedding in Ericeira, Portugal. The user has been asked to say a few words for the toast.

Respond in European Portuguese. Coach them through making a short, heartfelt toast. Suggest phrases they could use. Be encouraging and festive.

Help them with toast vocabulary, wishes, and compliments. Gently correct mistakes.'
),
(
  'Na mesa do bar',
  'Order drinks at the bar for you and Ky.',
  'wedding',
  3,
  'You are a bartender at a wedding reception in Ericeira, Portugal. The user wants to order drinks.

Respond in European Portuguese (Portugal). Be efficient but friendly. Ask what they would like, clarify quantities.

Use querer (to want) naturally. Gently correct Portuguese mistakes. Keep it realistic — this is a busy wedding bar.'
),
(
  'Que lugar lindo!',
  'Chat about how beautiful Ericeira is with another guest.',
  'wedding',
  3,
  'You are a Portuguese local at a wedding in Ericeira. The user is a foreign guest who wants to talk about how beautiful the location is.

Respond in European Portuguese. Be proud of your hometown. Share things to see and do in Ericeira. Ask what they think of Portugal.

Use estar (temporary states) and adjectives naturally. Gently correct mistakes.'
)
on conflict do nothing;

-- ============================================================
-- SR CARDS — Create initial cards for all phrases for both users
-- ============================================================

-- Insert sr_cards for Harry (all phrases, box 1, due today)
insert into sr_cards (user_id, phrase_id, box, next_review, ease_factor, interval_days)
select
  u.id,
  p.id,
  1,
  current_date,
  2.5,
  0
from users u, phrases p
where u.name = 'Harry'
on conflict (user_id, phrase_id) do nothing;

-- Insert sr_cards for Ky (all phrases, box 1, due today)
insert into sr_cards (user_id, phrase_id, box, next_review, ease_factor, interval_days)
select
  u.id,
  p.id,
  1,
  current_date,
  2.5,
  0
from users u, phrases p
where u.name = 'Ky'
on conflict (user_id, phrase_id) do nothing;
