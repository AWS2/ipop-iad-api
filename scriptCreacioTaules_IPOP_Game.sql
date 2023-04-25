CREATE DATABASE IF NOT EXISTS ipop_game;

USE ipop_game;

DROP TABLE IF EXISTS ranking;
DROP TABLE IF EXISTS ocupations;

CREATE TABLE ranking(
	idPlayer INTEGER NOT NULL AUTO_INCREMENT,
	aliasPlayer VARCHAR(255) UNIQUE,
    points INTEGER,
    timePlayed DOUBLE,
    correctMatches INTEGER,
    mismatches INTEGER,
    PRIMARY KEY(idPlayer)
);

CREATE TABLE ocupations(
	idOcupation INTEGER NOT NULL AUTO_INCREMENT,
    grade ENUM ('Mitjà', 'Superior'),
    family ENUM ('Informàtica', 'Administratiu', 'Automoció', 'Manteniment i serveis a la producció', 'Fabricació mecànica', 'Aigües'),
    
    cycle ENUM ('Sistemes microinformàtics i xarxes', 'Gestió administrativa', 'Electromecànica de vehicles automòbils', 'Manteniment electromecànics',
    'Mecanització', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'Desenvolupament d’aplicacions multiplataforma',
    'Desenvolupament d’aplicacions web', 'Administració i finances', 'Assistència a la direcció', 'Automoció', 'Mecatrònica industrial', 
    'Programació de la producció en fabricació mecànica', 'Gestió de l’aigua'),
    
    summary VARCHAR (255),
    link VARCHAR (255),
    PRIMARY KEY (idOcupation)
);

INSERT INTO ocupations (grade, family, cycle, summary, link) 
VALUES ('Mitjà', 'Informatica', 'Sistemes microinformàtics i xarxes', 'a) Personal tècnic instal·lador-reparador d’equips informàtics.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Mitjà', 'Informàtica', 'Sistemes microinformàtics i xarxes', 'b) Personal tècnic de suport informàtic.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Mitjà', 'Informàtica', 'Sistemes microinformàtics i xarxes', 'c) Personal tècnic de xarxes de dades.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Mitjà', 'Informàtica', 'Sistemes microinformàtics i xarxes', 'd) Personal reparador de perifèrics de sistemes microinformàtics.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Mitjà', 'Informàtica', 'Sistemes microinformàtics i xarxes', 'e) Comercials de microinformàtica.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Mitjà', 'Informàtica', 'Sistemes microinformàtics i xarxes', 'f) Personal operador de teleassistència.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Mitjà', 'Informàtica', 'Sistemes microinformàtics i xarxes', 'g) Personal operador de sistemes.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),

('Mitjà', 'Administratiu', 'Gestio administrativa', 'a) Personal auxiliar administratiu.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'b) Personal ajudant d’oficina.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'c) Personal auxiliar administratiu de cobraments i pagaments', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'd) Personal administratiu comercial. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'e) Personal auxiliar administratiu de gestió de personal. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'f) Personal auxiliar administratiu de les administracions públiques. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'g) Recepcionista.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'h) Personal empleat d’atenció al client. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'i) Personal empleat de tresoreria. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Mitjà', 'Administratiu', 'Gestio administrativa', 'j) Personal empleat de mitjans de pagament.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),

('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'a) Electronicistes de vehicles.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'b) Electricistes electrònics de manteniment i reparació en automoció.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'c) Personal mecànic d’automòbils.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'd) Electricistes d’automòbils.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'e) Personal electromecànic d’automòbils.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'f) Personal mecànic de motors i els seus sistemes auxiliars d’automòbils i motocicletes.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'g) Personal reparador de sistemes pneumàtics i hidràulics.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'h) Personal reparador de sistemes de transmissió i de frens.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'i) Personal reparador de sistemes de direcció i suspensió.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'j) Personal operari d’ITV.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'k) Personal instal·lador d’accessoris en vehicles.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'l) Personal operari d’empreses dedicades a la fabricació de recanvis.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'm) Personal electromecànic de motocicletes.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Mitjà', 'Automoció', 'Electromecànica de vehicles automòbils', 'n) Personal venedor/distribuïdor de recanvis i d’equips de diagnosi.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),

('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'a) Mecànic de manteniment.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'b) Muntador industrial.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'c) Muntador d’equips elèctrics.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'd) Muntador d’equips electrònics.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'e) Mantenidor de línia automatitzada.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'f) Muntador de béns d’equip.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'g) Muntador d’automatismes pneumàtics i hidràulics.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'h) Instal·lador electricista industrial.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Manteniment i serveis a la producció', 'Manteniment electromecànics', 'i) Electricista de manteniment i reparació d’equips de control, mesura i precisió.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),

('Mitjà', 'Fabricació mecànica', 'Mecanització', 'a) Personal ajustador operari de màquines eina.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Fabricació mecànica', 'Mecanització', 'b) Personal polidor de metalls i afilador d’eines.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Fabricació mecànica', 'Mecanització', 'c) Personal operador de màquines per treballar metalls.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Fabricació mecànica', 'Mecanització', 'd) Personal operador de màquines eina.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Fabricació mecànica', 'Mecanització', 'e) Personal operador de robots industrials.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Fabricació mecànica', 'Mecanització', 'f) Personal treballador de la fabricació d’eines, mecànic i ajustador, modelista matricer i similars.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Mitjà', 'Fabricació mecànica', 'Mecanització', 'g) Personal torner, fresador i mandrinador.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),

('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'a) Personal tècnic en administració de sistemes.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'b) Responsable d’informàtica.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'c) Personal tècnic en serveis d’Internet.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'd) Personal tècnic en serveis de missatgeria electrònica.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'e) Personal de recolzament i suport tècnic.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'f) Personal tècnic en teleassistència.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'g) Personal tècnic en administració de base de dades.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'h) Personal tècnic de xarxes.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'i) Personal supervisor de sistemes.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'j) Personal tècnic en serveis de comunicacions.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat', 'k) Personal tècnic en entorns web.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),

('Superior', 'Informàtica', 'Desenvolupament d’aplicacions multiplataforma', 'a) Desenvolupar aplicacions informàtiques per a la gestió empresarial i de negoci.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Desenvolupament d’aplicacions multiplataforma', 'b) Desenvolupar aplicacions de propòsit general.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Desenvolupament d’aplicacions multiplataforma', 'c) Desenvolupar aplicacions en l’àmbit de l’entreteniment i la informàtica mòbil.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),

('Superior', 'Informàtica', 'Desenvolupament d’aplicacions web', 'a) Programador web.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Desenvolupament d’aplicacions web', 'b) Programador multimèdia.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),
('Superior', 'Informàtica', 'Desenvolupament d’aplicacions web', 'c) Desenvolupador d’aplicacions en entorns web.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51497/tic.do'),

('Superior', 'Administratiu', 'Administració i finances', 'a) Administratiu d’oficina.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'b) Administratiu comercial.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'c) Administratiu financer.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'd) Administratiu comptable.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'e) Administratiu de logística.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'f) Administratiu de banca i d’assegurances.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'g) Administratiu de recursos humans.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'h) Administratiu de l’Administració pública.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'i) Administratiu d’assessories jurídiques, comptables, laborals, fiscals o gestories.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'j) Tècnic en gestió de cobraments.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Administració i finances', 'k) Responsable d’atenció al client.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),

('Superior', 'Administratiu', 'Assistència a la direcció', 'a) Assistent a la direcció.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Assistència a la direcció', 'b) Assistent personal.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Assistència a la direcció', 'c) Secretari de direcció.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Assistència a la direcció', 'd) Assistent de despatxos i oficines.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Assistència a la direcció', 'e) Assistent jurídic.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),
('Superior', 'Administratiu', 'Assistència a la direcció', 'f) Assistent en departaments de recursos humans.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51565/organitzacions-i-negoci.do'),

('Superior', 'Automoció', 'Automoció', 'a) Cap de l’àrea d’electromecànica.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'b) Recepcionista de vehicles.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'c) Cap de taller de vehicles de motor.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'd) Personal encarregat d’ITV.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'e) Personal perit taxador de vehicles.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'f) Cap de servei.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'g) Personal encarregat d’àrea de recanvis.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'h) Personal encarregat d’àrea comercial d’equips relacionats amb els vehicles.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),
('Superior', 'Automoció', 'Automoció', 'i) Cap de l’àrea de carrosseria: xapa i pintura.', 'https://treball.barcelonactiva.cat/porta22/cat/sectors/sectors.do'),

('Superior', 'Manteniment i serveis a la producció', 'Mecatrònica industrial', 'a) Tècnic en planificació i programació de processos de manteniment d’instal·lacions de maquinària i equip industrial. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Manteniment i serveis a la producció', 'Mecatrònica industrial', 'b) Cap d’equip de muntadors d’instal·lacions de maquinària i equip industrial. ', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Manteniment i serveis a la producció', 'Mecatrònica industrial', 'c) Cap d’equip de mantenidors d’instal·lacions de maquinària i equip industrial.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),

('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'a) Tècnic o tècnica en mecànica.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'b) Encarregat o encarregada d’instal·lacions de processament de metalls.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'c) Encarregat o encarregada d’operadors de màquines per treballar metalls.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'd) Encarregat o encarregada de muntadors.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'e) Programador o programadora de CNC (control numèric amb ordinador).', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'f) Programador o programadora de sistemes automatitzats en fabricació mecànica.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),
('Superior', 'Fabricació mecànica', 'Programació de la producció en fabricació mecànica', 'g) Programador o programadora de la producció.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51495/industria-manufacturera-i-40.do'),

('Superior', 'Aigües', 'Gestió de l’aigua', 'a) Encargado de montaje de redes de abastecimiento y distribución de agua.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'b) Encargado de montaje de redes e instalaciones de saneamiento.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'c) Encargado de mantenimiento de redes de agua.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'd) Encargado de mantenimiento de redes de saneamiento.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'e) Operador de planta de tratamiento de agua de abastecimiento.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'f) Operador de planta de tratamiento de aguas residuales.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'g) Técnico en gestión del uso eficiente del agua.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do'),
('Superior', 'Aigües', 'Gestió de l’aigua', 'h) Técnico en sistemas de distribución de agua.', 'https://treball.barcelonactiva.cat/porta22/cat/sector/pagina51492/economia-verda-i-circular.do');














































































