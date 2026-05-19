-- Seed public memorials for AdSense content review
-- Replace <KEITH_USER_ID> with Keith's profile UUID before running.
-- All entries are public-domain historical figures suitable as community content.

DO $$
DECLARE
  owner_id uuid := '90c1969a-13e3-4cf8-b0d6-87b59381342d';
BEGIN

INSERT INTO gravesite_profiles
  (user_id, deceased_name, slot_category, cemetery_name, cemetery_state,
   date_of_birth, date_of_death, bio, latitude, longitude, is_public)
VALUES
  (owner_id, 'Frederick Douglass', 'other', 'Mount Hope Cemetery', 'NY',
   '1818-02-01', '1895-02-20',
   'Frederick Douglass was an American social reformer, abolitionist, orator, writer, and statesman. After escaping from slavery in Maryland, he became a national leader of the abolitionist movement. His powerful oratory and incisive antislavery writings made him one of the most famous African Americans of the 19th century.',
   43.1612, -77.6005, true),

  (owner_id, 'Harriet Tubman', 'other', 'Fort Hill Cemetery', 'NY',
   '1822-03-15', '1913-03-10',
   'Harriet Tubman was an American abolitionist and political activist. Born into slavery, she escaped and subsequently made some 13 missions to rescue approximately 70 enslaved people, including family and friends, using the network of antislavery activists and safe houses known as the Underground Railroad.',
   42.9314, -76.5544, true),

  (owner_id, 'Abraham Lincoln', 'other', 'Oak Ridge Cemetery', 'IL',
   '1809-02-12', '1865-04-15',
   'Abraham Lincoln was an American lawyer and statesman who served as the 16th president of the United States. Lincoln led the nation through the American Civil War, defending the nation as a constitutional union, defeating the insurgent Confederacy, abolishing slavery, expanding the power of the federal government, and modernizing the U.S. economy.',
   39.8221, -89.6565, true),

  (owner_id, 'Susan B. Anthony', 'other', 'Mount Hope Cemetery', 'NY',
   '1820-02-15', '1906-03-13',
   'Susan B. Anthony was an American social reformer and women''s rights activist who played a pivotal role in the women''s suffrage movement. She traveled the United States and Europe and gave 75 to 100 speeches per year on women''s rights for 45 years.',
   43.1612, -77.6005, true),

  (owner_id, 'Martin Luther King Jr.', 'other', 'South View Cemetery', 'GA',
   '1929-01-15', '1968-04-04',
   'Martin Luther King Jr. was an American Baptist minister and activist who became the most visible spokesperson and leader in the American civil rights movement from 1955 until his assassination in 1968. King is best known for advancing civil rights through nonviolence and civil disobedience.',
   33.6776, -84.3922, true),

  (owner_id, 'Rosa Parks', 'other', 'Woodlawn Cemetery', 'MI',
   '1913-02-04', '2005-10-24',
   'Rosa Parks was an American activist in the civil rights movement, best known for her pivotal role in the Montgomery bus boycott. The United States Congress has called her "the first lady of civil rights" and "the mother of the freedom movement."',
   42.4203, -83.1207, true),

  (owner_id, 'Mark Twain', 'other', 'Woodlawn Cemetery', 'NY',
   '1835-11-30', '1910-04-21',
   'Samuel Langhorne Clemens, known by his pen name Mark Twain, was an American writer, humorist, entrepreneur, publisher, and lecturer. He was praised as the "greatest humorist the United States has produced," and William Faulkner called him "the father of American literature."',
   42.0834, -76.8156, true),

  (owner_id, 'Edgar Allan Poe', 'other', 'Westminster Hall Burying Ground', 'MD',
   '1809-01-19', '1849-10-07',
   'Edgar Allan Poe was an American writer, poet, editor, and literary critic. Poe is best known for his poetry and short stories, particularly his tales of mystery and the macabre. He is widely regarded as a central figure of Romanticism in the United States and of American literature as a whole.',
   39.2904, -76.6204, true),

  (owner_id, 'Emily Dickinson', 'other', 'West Cemetery', 'MA',
   '1830-12-10', '1886-05-15',
   'Emily Dickinson was an American poet. Little known during her life, she has since been regarded as one of the most important figures in American poetry. Her poems explore themes of death, faith, nature, and immortality, often through unconventional verse and punctuation.',
   42.3732, -72.5199, true),

  (owner_id, 'Walt Whitman', 'other', 'Harleigh Cemetery', 'NJ',
   '1819-05-31', '1892-03-26',
   'Walt Whitman was an American poet, essayist, and journalist. A humanist, he was a part of the transition between transcendentalism and realism, incorporating both views in his works. Whitman is among the most influential poets in the American canon, often called the father of free verse.',
   39.9259, -75.1196, true),

  (owner_id, 'Eleanor Roosevelt', 'other', 'Springwood Estate', 'NY',
   '1884-10-11', '1962-11-07',
   'Eleanor Roosevelt was an American political figure, diplomat, and activist who served as the First Lady of the United States from 1933 to 1945. She was a longtime advocate for human rights and reshaped the role of First Lady, becoming one of the most admired women of the 20th century.',
   41.7672, -73.9335, true),

  (owner_id, 'Helen Keller', 'other', 'Washington National Cathedral', 'DC',
   '1880-06-27', '1968-06-01',
   'Helen Adams Keller was an American author, disability rights advocate, political activist and lecturer. Born deaf and blind, she went on to become the first deaf-blind person to earn a Bachelor of Arts degree and an inspiration for millions worldwide.',
   38.9304, -77.0708, true),

  (owner_id, 'John F. Kennedy', 'other', 'Arlington National Cemetery', 'VA',
   '1917-05-29', '1963-11-22',
   'John Fitzgerald Kennedy, often referred to by his initials JFK, was an American politician who served as the 35th president of the United States from January 1961 until his assassination in November 1963. He was the youngest person elected president and a key figure during the Cold War.',
   38.8783, -77.0687, true),

  (owner_id, 'Jackie Kennedy Onassis', 'other', 'Arlington National Cemetery', 'VA',
   '1929-07-28', '1994-05-19',
   'Jacqueline Lee Kennedy Onassis was an American writer, photographer, and book editor who served as the First Lady of the United States from 1961 to 1963 as the wife of President John F. Kennedy. She was admired worldwide for her style, elegance, and dedication to historic preservation.',
   38.8783, -77.0687, true),

  (owner_id, 'Babe Ruth', 'other', 'Gate of Heaven Cemetery', 'NY',
   '1895-02-06', '1948-08-16',
   'George Herman "Babe" Ruth Jr. was an American professional baseball player whose career in Major League Baseball spanned 22 seasons. Nicknamed "the Bambino" and "the Sultan of Swat," he is widely regarded as one of the greatest baseball players of all time.',
   41.0840, -73.7807, true),

  (owner_id, 'Marilyn Monroe', 'other', 'Westwood Village Memorial Park', 'CA',
   '1926-06-01', '1962-08-04',
   'Marilyn Monroe was an American actress, model, and singer. Famous for playing comedic "blonde bombshell" characters, she became one of the most popular sex symbols of the 1950s and early 1960s and was emblematic of the era''s changing attitudes towards sexuality.',
   34.0581, -118.4404, true),

  (owner_id, 'Elvis Presley', 'other', 'Graceland', 'TN',
   '1935-01-08', '1977-08-16',
   'Elvis Aaron Presley was an American singer and actor. Dubbed the "King of Rock and Roll," he is regarded as one of the most significant cultural figures of the 20th century. His energized interpretations of songs and sexually provocative performance style made him enormously popular.',
   35.0454, -90.0226, true),

  (owner_id, 'Johnny Cash', 'other', 'Hendersonville Memory Gardens', 'TN',
   '1932-02-26', '2003-09-12',
   'John R. Cash was an American singer-songwriter. Much of Cash''s music contained themes of sorrow, moral tribulation, and redemption, especially in the later stages of his career. He was known for his deep, calm bass-baritone voice and his distinctive sound.',
   36.3027, -86.6200, true),

  (owner_id, 'Steve Jobs', 'other', 'Alta Mesa Memorial Park', 'CA',
   '1955-02-24', '2011-10-05',
   'Steven Paul Jobs was an American business magnate, industrial designer, investor, and media proprietor. He was the chairman, chief executive officer, and co-founder of Apple Inc., the chairman and majority shareholder of Pixar, and the founder, chairman, and CEO of NeXT.',
   37.4225, -122.1290, true),

  (owner_id, 'Ruth Bader Ginsburg', 'other', 'Arlington National Cemetery', 'VA',
   '1933-03-15', '2020-09-18',
   'Ruth Bader Ginsburg was an American lawyer and jurist who served as an associate justice of the Supreme Court of the United States from 1993 until her death in 2020. She was generally viewed as belonging to the liberal wing of the court and is known for her championing of women''s rights and gender equality.',
   38.8783, -77.0687, true);

-- Update slots_used counter to reflect the new memorials
UPDATE profiles
SET slots_used = (
  SELECT COUNT(*) FROM gravesite_profiles WHERE user_id = owner_id
)
WHERE id = owner_id;

END $$;
