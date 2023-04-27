CREATE DATABASE IF NOT EXISTS ipop_game;

USE ipop_game;

-- the tables will be resetted
DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS totem;
DROP TABLE IF EXISTS cycle;
DROP TABLE IF EXISTS ranking;
DROP TABLE IF EXISTS professionalFamily;

-- Statements to create the tables
CREATE TABLE cycle(
	idCycle INTEGER NOT NULL,
    nameCycle VARCHAR(255),
    grade ENUM ('Mitjà', 'Superior'),
    family_idFamily INTEGER NOT NULL,
	PRIMARY KEY(idCycle)
);

CREATE TABLE ranking(
	idPlayer INTEGER NOT NULL AUTO_INCREMENT,
	aliasPlayer VARCHAR(255) UNIQUE,
    timePlayed DOUBLE,
    correctTotems INTEGER,
    wrongTotems INTEGER,
    points INTEGER,
    PRIMARY KEY(idPlayer)
);

CREATE TABLE game(
	idGame INTEGER NOT NULL AUTO_INCREMENT,
	timePlayed DOUBLE,
    correctTotems INTEGER,
    wrongTotems INTEGER,
    points INTEGER,
    ranking_idPlayer INTEGER NOT NULL,
    cycle_idCycle INTEGER NOT NULL,
	PRIMARY KEY(idGame),
    FOREIGN KEY (ranking_idPlayer) REFERENCES ranking(idPlayer),
    FOREIGN KEY (cycle_idCycle) REFERENCES cycle(idCycle)
);

CREATE TABLE professionalFamily(
	idFamily INTEGER NOT NULL,
    nameFamily VARCHAR(255),
    link VARCHAR(255),
	PRIMARY KEY(idFamily)
);

CREATE TABLE totem(
	idTotem INTEGER NOT NULL AUTO_INCREMENT,
    descriptionTotem VARCHAR(255),
    cycle_idCycle INTEGER,
	PRIMARY KEY(idTotem),
    FOREIGN KEY (cycle_idCycle) REFERENCES cycle(idCycle)
);

-- INSERT statements for cycle table
INSERT INTO cycle (idCycle, nameCycle, grade, family_idFamily) VALUES
(1, 'Sistemes microinformàtics i xarxes', 'Mitjà', 1),
(2, 'Gestió administrativa', 'Mitjà', 2),
(3, 'Electromecànica de vehicles automòbils', 'Mitjà', 3),
(4, 'Manteniment electromecànics', 'Mitjà', 4),
(5, 'Mecanització', 'Mitjà', 5),

(6, 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'Superior', 1),
(7, 'Desenvolupament d’aplicacions multiplataforma', 'Superior', 1),
(8, 'Desenvolupament d’aplicacions web', 'Superior', 1),
(9, 'Administració i finances', 'Superior', 2),
(10, 'Assistència a la direcció', 'Superior', 2),
(11, 'Automoció', 'Superior', 3),
(12, 'Mecatrònica industrial', 'Superior', 4),
(13, 'Programació de la producció en fabricació mecànica', 'Superior', 5),
(14, 'Gestió de l’aigua', 'Superior', 6);

-- INSERT statements for professionalFamily table
INSERT INTO professionalFamily (idFamily, nameFamily, link) VALUES
(1, 'Informàtica', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
(2, 'Administratiu', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
(3, 'Automoció', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
(4, 'Manteniment i serveis a la producció', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
(5, 'Fabricació mecànica', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
(6, 'Aigües', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do');

-- INSERT statements for totem table
INSERT INTO totem (descriptionTotem, cycle_idCycle) VALUES
('a) Personal tècnic instal·lador-reparador d’equips informàtics.', 1),
('b) Personal tècnic de suport informàtic. ', 1),
('c) Personal tècnic de suport informàtic. ', 1),
('d) Personal reparador de perifèrics de sistemes microinformàtics. ', 1),
('e) Comercials de microinformàtica. ', 1),
('f) Personal operador de teleassistència. ', 1),
('g) Personal operador de sistemes.', 1),

('a) Personal auxiliar administratiu.', 2),
('b) Personal ajudant d’oficina. ', 2),
('c) Personal auxiliar administratiu de cobraments i pagaments', 2),
('d) Personal administratiu comercial. ', 2),
('e) Personal auxiliar administratiu de gestió de personal. ', 2),
('f) Personal auxiliar administratiu de les administracions públiques. ', 2),
('g) Recepcionista. ', 2),
('h) Personal empleat d’atenció al client. ', 2),
('i) Personal empleat de tresoreria. ', 2),
('j) Personal empleat de mitjans de pagament.', 2),

('a) Electronicistes de vehicles. ', 3),
('b) Electricistes electrònics de manteniment i reparació en automoció. ', 3),
('c) Personal mecànic d’automòbils. ', 3),
('d) Electricistes d’automòbils. ', 3),
('e) Personal electromecànic d’automòbils. ', 3),
('f) Personal mecànic de motors i els seus sistemes auxiliars d’automòbils i motocicletes. ', 3),
('g) Personal reparador de sistemes pneumàtics i hidràulics. ', 3),
('h) Personal reparador de sistemes de transmissió i de frens. ', 3),
('i) Personal reparador de sistemes de direcció i suspensió. ', 3),
('j) Personal operari d’ITV', 3),
('k) Personal instal·lador d’accessoris en vehicles. ', 3),
('l) Personal operari d’empreses dedicades a la fabricació de recanvis. ', 3),
('m) Personal electromecànic de motocicletes.', 3),
('n) Personal venedor/distribuïdor de recanvis i d’equips de diagnosi.', 3),

('a) Mecànic de manteniment. ', 4),
('b) Muntador industrial. ', 4),
('c) Muntador d’equips elèctrics. ', 4),
('d) Muntador d’equips electrònics. ', 4),
('e) Mantenidor de línia automatitzada.', 4),
('f) Muntador de béns d’equip. ', 4),
('g) Muntador d’automatismes pneumàtics i hidràulics. ', 4),
('h) Instal·lador electricista industrial. ', 4),
('i) Electricista de manteniment i reparació d’equips de control, mesura i precisió.', 4),

('a) Personal ajustador operari de màquines eina. ', 5),
('b) Personal polidor de metalls i afilador d’eines. ', 5),
('c) Personal operador de màquines per treballar metalls. ', 5),
('d) Personal operador de màquines eina. ', 5),
('e) Personal operador de robots industrials. ', 5),
('f) Personal treballador de la fabricació d’eines, mecànic i ajustador, modelista matricer i similars. ', 5),
('g) Personal torner, fresador i mandrinador. ', 5),

('a) Personal tècnic en administració de sistemes. ', 6),
('b) Responsable d’informàtica. ', 6),
('c) Personal tècnic en serveis d’Internet. ', 6),
('d) Personal tècnic en serveis de missatgeria electrònica. ', 6),
('e) Personal de recolzament i suport tècnic. ', 6),
('f) Personal tècnic en teleassistència. ', 6),
('g) Personal tècnic en administració de base de dades. ', 6),
('h) Personal tècnic de xarxes. ', 6),
('i) Personal supervisor de sistemes. ', 6),
('j) Personal tècnic en serveis de comunicacions. ', 6),
('k) Personal tècnic en entorns web.', 6),

('a) Desenvolupar aplicacions informàtiques per a la gestió empresarial i de negoci. ', 7),
('b) Desenvolupar aplicacions de propòsit general. ', 7),
('c) Desenvolupar aplicacions en l’àmbit de l’entreteniment i la informàtica mòbil.', 7),

('a) Programador web. ', 8),
('b) Programador multimèdia. ', 8),
('c) Desenvolupador d’aplicacions en entorns web.', 8),

('a) Administratiu d’oficina. ', 9),
('b) Administratiu comercial. ', 9),
('c) Administratiu financer. ', 9),
('d) Administratiu comptable. ', 9),
('e) Administratiu de logística.', 9),
('f) Administratiu de banca i d’assegurances. ', 9),
('g) Administratiu de recursos humans. ', 9),
('h) Administratiu de l’Administració pública. ', 9),
('j) Tècnic en gestió de cobraments. ', 9),
('k) Responsable d’atenció al client.', 9),

('a) Assistent a la direcció. ', 10),
('b) Assistent personal. ', 10),
('c) Secretari de direcció. ', 10),
('d) Assistent de despatxos i oficines. ', 10),
('e) Assistent jurídic. ', 10),
('f) Assistent en departaments de recursos humans. ', 10),
('g) Administratiu en les administracions i organismes públics. ', 10),

('a) Cap de l’àrea d’electromecànica. ', 11),
('b) Recepcionista de vehicles.', 11),
('c) Cap de taller de vehicles de motor. ', 11),
('d) Personal encarregat d’ITV. ', 11),
('e) Personal perit taxador de vehicles. ', 11),
('f) Cap de servei. ', 11),
('g) Personal encarregat d’àrea de recanvis. ', 11),
('h) Personal encarregat d’àrea comercial d’equips relacionats amb els vehicles. ', 11),
('i) Cap de l’àrea de carrosseria: xapa i pintura.', 11),

('a) Tècnic en planificació i programació de processos de manteniment d’instal·lacions de maquinària i equip industrial. ', 12),
('b) Cap d’equip de muntadors d’instal·lacions de maquinària i equip industrial. ', 12),
('c) Cap d’equip de mantenidors d’instal·lacions de maquinària i equip industrial.', 12),

('a) Tècnic o tècnica en mecànica. ', 13),
('b) Encarregat o encarregada d’instal·lacions de processament de metalls. ', 13),
('c) Encarregat o encarregada d’operadors de màquines per treballar metalls. ', 13),
('d) Encarregat o encarregada de muntadors. ', 13),
('e) Programador o programadora de CNC (control numèric amb ordinador). ', 13),
('f) Programador o programadora de sistemes automatitzats en fabricació mecànica. ', 13),
('g) Programador o programadora de la producció.', 12),

('a) Encargado de montaje de redes de abastecimiento y distribución de agua. ', 14),
('b) Encargado de montaje de redes e instalaciones de saneamiento. ', 14),
('c) Encargado de mantenimiento de redes de agua.', 14),
('d) Encargado de mantenimiento de redes de saneamiento. ', 14),
('e) Operador de planta de tratamiento de agua de abastecimiento. ', 14),
('f) Operador de planta de tratamiento de aguas residuales. ', 14),
('g) Técnico en gestión del uso eficiente del agua', 14),
('h) Técnico en sistemas de distribución de agua.', 14);


