import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedFinanciers1645191297914 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO public.financier (id, acronym, name, code) VALUES (1, null, 'Conselho Nacional de Desenvolvimento Científico e Tecnológico', '002200000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (2, null, 'Agência Nacional de Energia Elétrica', '055100000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (3, null, 'IBM Research Brazil', '516400000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (4, null, 'Centro de Pesquisa e Desenvolvimento Leopoldo Américo Miguêz de Mello', '004700000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (5, null, 'Financiadora de Estudos e Projetos', '869700000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (6, null, 'Fundação de Amparo à Ciência e Tecnologia do Estado de Pernambuco', '876400000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (7, null, 'Fundação de Apoio ao Desenvolvimento da Universidade Federal de Pernambuco', '831900000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (8, null, 'Elcoma Computadores LTDA', '002200000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (9, null, 'Moura Baterias Automotivas e Industriais', '002400000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (10, null, 'Samsung Instituto de Desenvolvimento de Informática', '000200000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (11, null, 'Samsung Eletrônica da Amazônia', 'J86S00000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (12, null, 'Samkwang Brasil Ind. Com. de Artefatos Para Aparelhos Celulares', '000700000992');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (13, null, 'Facebook Research', '002400000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (14, null, 'Instituto Serrapilheira', '000900000996');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (15, null, 'Coordenação de Aperfeiçoamento de Pessoal de Nível Superior', '045000000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (16, null, '', '');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (17, null, 'Gabinete de Relações Internacionais da Ciência e do Ensino Superior', '581600000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (18, null, 'Blekinge Institute of Technology', 'J0QJ00000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (19, null, 'Tribunal de JustiÃ§a de Pernambuco', '002300000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (20, null, 'CNPq', '001500000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (21, null, 'Companhia Hidro Elétrica do São Francisco', '015200000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (22, null, 'CYTED', '000300000995');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (23, null, 'iTAUTEC-PHILCO S.A', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (24, null, 'Núcleo de Informação e Coordenação do Ponto BR', 'J84R00000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (25, null, 'Financiadora de Estudos e Projetos / FINEP', '985600212862');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (26, null, 'Secretaria Saúde do Recife', '985600157268');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (27, null, 'Universidade Federal de Campina Grande', '985600141027');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (28, null, 'Motorola Industrial Ltda.', 'IZIG00000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (29, null, 'Universidade Federal de Pernambuco', '002100000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (30, null, 'Deutscher Akademischer Austauschdienst', '353600000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (31, null, 'AiLeader Tecnologia', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (32, null, 'Vert Soluções em TI', '001200000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (33, null, 'Login Lógica e Informática', 'IXO900000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (34, null, 'Engevix Estudos e Projetos de Engenharia', '006800000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (35, null, 'Callere Soluções e Comercialização em Informática', 'JI2100000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (36, null, 'Federação Brasileira de Bancos', '002400000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (37, null, 'Universidade de Pernambuco', '061400000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (38, null, 'National Science Foundation', '087500000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (39, null, 'Associação dos Servidores do CNPq', 'JJJ600000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (40, null, 'Universidade Federal de Campina Grande', '446900000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (41, null, 'Universidade Federal do Rio Grande do Norte', '033700000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (42, null, 'Fundação de Amparo à Pesquisa do Estado de Alagoas', '036500000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (43, null, 'British Council', '469700000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (44, null, 'Ministerio de Asuntos Exteriores Y de Cooperación', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (45, null, 'Faculdades Integradas Barros Melo', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (46, null, 'Ibm Coorporation', '108600000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (47, null, 'Fundação Cearense de Apoio ao Desenvolvimento Científico e Tecnológico', '795500000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (48, null, 'World Wide Web Consortium', '000600000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (49, null, 'Centro de Informática', '002001000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (50, null, 'Faculdade Integrada do Recife', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (51, null, 'Comunidade Européia', '001200000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (52, null, 'Fundação Carlos Chagas Filho de Amparo à Pesquisa do Estado do RJ', '187100000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (53, null, 'Rede Nacional de Ensino e Pesquisa', '985600042029');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (54, null, 'Fundação de Amparo à Pesquisa do Estado de São Paulo', '037700000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (55, null, 'Fundação de Amparo à Pesquisa do Estado de SP', 'K0OO00000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (56, null, 'Universidade Federal da Bahia', '029100000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (57, null, 'Real Hospital Português de Beneficência Em Pernambuco', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (58, null, 'Rede Nacional de Ensino e Pesquisa', '000300000995');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (59, null, 'Fundação Centro de Pesquisa e Desenvolvimento em Telecomunicações', '007400000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (60, null, 'Universidade Estadual de Campinas', '007900000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (61, null, 'Universidade do Estado do Rio de Janeiro', '032600000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (62, null, 'Universidade de São Paulo', '006700000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (63, null, 'Universidade Federal do Rio de Janeiro', '020200000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (64, null, 'Universidade Federal de Santa Catarina', '004300000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (65, null, 'Universidade de Coimbra, Instituto do Mar', 'J08L00000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (66, null, 'Deutscher Akademischer Austauschdienst', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (67, null, 'Fitec', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (68, null, 'Novus', '000300000995');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (69, null, 'Datacom', '000500000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (70, null, 'Petróleo Brasileiro - Rio de Janeiro - Matriz', '028700000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (71, null, 'Eletrobrás Furnas', '001400000995');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (72, null, 'MAML PROCESSAMENTO DE DADOS LTDA', '001500000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (73, null, 'SIDI RECIFE', 'JFWY00000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (74, null, 'Fundação O Boticário de Proteção à Natureza', '985600187280');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (75, null, 'Hewlett-Packard Brasil - Matriz', '570300000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (76, null, 'Fundação de Apoio à Pesquisa do Estado da Paraíba', '834600000007');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (77, null, 'Companhia Energética do Estado de Pernambuco', '985600091690');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (78, null, 'Deutsche Forschungsgemeinschaft', '465200000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (79, null, 'Fundação de Apoio à Pesquisa do Distrito Federal', '786500000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (80, null, 'Centro Nacional de Pesquisa em Energia e Materiais', '004100000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (81, null, 'Microsoft Corporation', '906900000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (82, null, '(CNPq) Conselho Nacional de Desenvolvimento Científico e Tecnológico', '001600000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (83, null, '(FACEPE) Fundação de Amparo à Ciência e Tecnologia do Estado de Pernambuco', '001000000998');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (84, null, 'Ericsson Telecomunicações S.A', '000600000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (85, null, 'Ericsson Telecomunicações S.A', '000700000992');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (86, null, 'Engetron Engenharia Eletronica Industria e Comercio Ltda', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (87, null, 'Telefonaktiebolaget LM Ericsson', 'IZH400000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (88, null, 'Indorama Ventures Polímeros S.A.', '004100000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (89, null, 'Conselho Nacional de Desenvolvimento Científico e Tecnológico', '000900000996');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (90, null, 'Universidade Federal de Sergipe', '007000000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (91, null, 'Tribunal de Contas do Estado de Pernambuco', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (92, null, 'Institut National de Recherche en Informatique et en Automatique - Siège', '352200000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (93, null, 'Max Planck Institut of Molecular Plant Physiology', '387600000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (94, null, 'Centre National de la Recherche Scientifique', '163300000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (108, null, 'CAPES - Centro Anhanguera de Promoção e Educação Social', 'IVIR00000007');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (109, null, 'Universidade Federal de Alagoas', '033100000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (110, null, 'Petrobrás', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (111, null, 'Ministério da Educação', '028000000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (95, null, 'Stevens Institute of Technology', '153100000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (96, null, 'The National Science Foundation', '985600993180');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (97, null, 'Ministério da Ciência, Tecnologia e Inovações', '051600000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (98, null, 'Motorola Industrial LTDA', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (99, null, 'Comunidade Européia', '001500000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (100, null, 'Universidade Federal do Rio Grande do Sul', '019200000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (101, null, 'Pontifícia Universidade Católica do Rio Grande do Sul', '000600000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (102, null, 'University of Oxford', '127400000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (103, null, 'Technical University of Denmark', '132700000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (104, null, 'University of Oldenburgh', '000300000995');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (105, null, 'University of Kiel', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (106, null, 'European Commission', 'G4YT00000007');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (107, null, 'EPSRC', '000500000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (112, null, 'Centro de Estudos e Sistemas Avançados do Recife', '091400000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (113, null, 'Fundação de Amparo à Pesquisa do Estado da Bahia', '036700000004');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (114, null, 'Secretariade de Saúde do Estado de Pernambuco', '000500000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (115, null, 'COFECUB', '0O2400000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (116, null, 'Instituto Nacional de Ciência e Tecnologia para Engenharia de Software', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (117, null, 'Companhia Energética de Pernambuco', '767200000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (118, null, 'European Comission', '000500000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (119, null, 'Royal Academy of Engineering', '002100000998');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (120, null, 'Institut National de Recherche En Informatique', '388500000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (121, null, 'Instituto Nacional de Pesquisas Espaciais', '008700000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (122, null, 'Karlsruher Institut für Technologie', '139000000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (123, null, 'Deutsches Zentrum für Luft - und Raumfahrt', '838500000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (124, null, 'Hewllet Packard Co.', '901900000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (125, null, 'Fundação de Amparo à Pesquisa do Estado de Minas Gerais', '899900000007');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (126, null, 'Comunidade Europeia', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (127, null, 'Université Pierre et Marie Curie', '165600000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (128, null, 'Max-Planck-Institut für Molekulare Genetik', '000900000996');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (129, null, 'Fundação para a Ciência e a Tecnologia', '985601448266');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (130, null, 'Centro Cientifico Tecnologico Conicet de Rosario', 'J4IO00000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (131, null, 'Science Foundadtion', '003000000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (132, null, 'Samkwang Brasil Ind. Com. de Artefatos Para Aparelhos Celulares', '006000000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (133, null, 'Secretaria de Saúde de Pernambuco', '000600000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (134, null, 'Coordenação de Aperfeiçoamento de Pessoal de Nível Superior', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (135, null, 'Instituto Nacional de Ciência e Tecnologia para Engenharia de Software', '002300000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (136, null, 'Darmstadt University of Technology', '420500000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (137, null, 'Lancaster University', '466600000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (138, null, 'Centro de Estudos e Sistemas Avançados do Recife', '000200000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (139, null, 'Accenture', 'JF3200000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (140, null, 'Fundação de Amparo à Pesquisa do Estado da Bahia', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (141, null, 'Rotary Club do Recife Encanta Moça', '005000000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (142, null, 'Sebrae PERNAMBUCO PE', '004900000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (143, null, 'Serviço Brasileiro de Apoio às Micro e Pequenas Empresas', '852100000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (144, null, 'Positivo Informática - Matriz', 'IZGB00000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (145, null, 'Viitra Inovações Tecnológicas', 'JH9R00000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (146, null, 'Serviço Nacional de Aprendizagem Comercial - PE', 'JAI900000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (147, null, 'Netherlands Shared Cultural Heritage Fund', '007100000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (148, null, 'Instituto Ayrton Senna', 'J4T900000007');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (149, null, 'Conselho Nacional de Desenvolvimento Científico e Tecnológico', '003000000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (150, null, 'MULTIDISCIPLINARY UNIVERSITY RESEARCH INITIATIVE (MURI) - DARPA', '003100000996');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (151, null, 'Universidade de Brasília', '024000000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (152, null, 'Information Society Technologies (IST)', '000900000996');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (153, null, 'Universidade Federal da Paraíba', '008300000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (154, null, 'Empresa Ci T', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (155, null, 'Centro de Tecnologia da Informação Renato Archer', '420700000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (156, null, 'Fundação de Previdência Complementar', 'JJO200000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (157, null, 'Universidade Federal de Santa Maria', '032700000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (158, null, 'Universidade Católica de Pelotas', '010200000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (159, null, 'Ericsson Telecomunicações S.A', '000300000995');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (160, null, 'Ericsson Telecomunicações - Matriz', 'IZHD00000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (161, null, 'Fundação Bill e Melinda Gates', '001500000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (162, null, 'Instituto de Tecnologia do Amazonas', '001000000998');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (163, null, 'Companhia Energética de Alagoas', '985600210886');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (164, null, 'Universidade Federal do Vale do São Francisco', '577300000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (165, null, 'Tribunal de Justiça de Pernambuco', '002600000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (166, null, 'Universidade Salvador', '462400000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (167, null, 'Departamento de Ciência e Tecnologia - Exército Brasileiro', '985600205726');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (168, null, 'Centro de P & D em Tecnologias Digitais para Informação e Comunicação', '000700000992');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (169, null, 'Royal Academy of Engineering', '001000000998');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (170, null, 'Ttribunal de Contas do Estado de Pernambuco', 'J7YA00000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (171, null, 'University of Limerick', '000500000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (172, null, 'Réseau Franco-Brésilien en Mathématiques', '001500000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (173, null, 'Hewlett-Packard Computadores', '985600412691');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (174, null, 'Laboratório de Performance Itautec-CIn', '001000000998');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (175, null, 'Programa de Iniciação Científica e Tecnológica do Centro Universitário Lute', '000200000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (176, null, 'AiLeader Tecnologia', '001100000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (177, null, 'Petrobras (RN-CE)', '001800000992');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (178, null, 'Petrobras - Unidade de Negócios RN-CE', '001900000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (179, null, 'Universidade Federal de Minas Gerais', '033300000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (180, null, 'Comando de Defesa Cibernética', '002400000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (181, null, 'Institut National de Recherche en Informatique et en Au', '000500000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (182, null, 'Institut National de Recherche en Informatique et  en Autotmatique', '000400000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (183, null, 'Iowa State University', '150300000009');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (184, null, 'Motorola', '000100000991');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (185, null, 'Meantime Desenvolvimento e Exportação de Software', 'CEPS00000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (186, null, 'Qualiti Assessoria e Consultoria S/A', '985600148099');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (187, null, 'Pontifícia Universidade Católica do Rio de Janeiro', '011100000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (188, null, 'Pontifícia Universidade Católica de Minas Gerais', '117800000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (189, null, 'Instituto Militar de Engenharia', '869900000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (190, null, 'Universidade do Estado do Rio Grande do Norte', '501100000002');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (191, null, 'Universidade de Buenos Aires', 'IXV100000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (196, null, 'Comunidade Européia', '001100000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (192, null, 'Universidad de los Andes Colombia', '220000000008');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (193, null, 'Universidad Nacional Del Centro de La Provincia de Buenos Aires', '675600000001');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (194, null, 'Universidad Tecnica Federico Santa Maria - Chile', '077900000005');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (195, null, 'Universidad de Chile', '985600433982');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (198, null, 'Eramus+', '001300000993');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (206, null, 'Padtec S/A', '001000000998');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (207, null, 'Ministério do Planejamento, Orçamento e Gestão', 'IZJL00000003');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (208, null, 'TERRACAP', '001500000997');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (197, null, 'Escola Politécnica de Pernambuco', '000800000994');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (199, null, 'Cofecub', '000700000992');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (200, null, 'Centro de Informática - UFPE', '001100000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (201, null, 'Institut de Recherche pour le Développement', '070300000007');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (202, null, 'Ministère des Affaires Étrangères', '985600161753');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (203, null, 'Région Ile de France', '001600000999');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (204, null, 'Université de Paris X, Nanterre', '165500000000');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (205, null, 'Université Paris-Est Créteil Val-de-Marne', '161400000006');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (209, null, 'Qualiti Software Processes', '000600000990');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (210, null, 'Serviço de Apoio às Micro e Pequenas Empresas de Recife', '985600201488');
    INSERT INTO public.financier (id, acronym, name, code) VALUES (211, null, 'Empresa Municipal de Informática', '001800000992');
    `);

    await queryRunner.query(`SELECT setval('financier_id_seq', (SELECT MAX(id) FROM financier));`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "financier"`);
  }
}
