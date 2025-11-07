// import { Task } from "./table";

// export const mockTasks: Task[] = [
//   // Level 1 - Root tasks
//   {
//     id: '1',
//     name: 'Komplexné majetkové vysporiadania a prevody nehnuteľností pre ministerstvo',
//     origin: '12.2.2024',
//     priority: 'high',
//     status: 'Hotová',
//     completionDate: '12.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'M. Hrnčiarová',
//     source: 'Porada vedenia 2024/43 16.2.',
//   },
//   {
//     id: '2',
//     name: 'ZOBZ o zariadení vecného bremena pre elektroenergetické vedenia a zariadenia',
//     origin: '12.2.2024',
//     priority: 'high',
//     status: 'Nedokončená',
//     completionDate: '12.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'M. Hrnčiarová',
//     source: 'Porada vedenia 2024/43',
//   },
//   {
//     id: '3',
//     name: 'Modernizácia a správa celkovej IT infraštruktúry organizácie na rok 2024',
//     origin: '15.2.2024',
//     priority: 'medium',
//     status: 'Zadaná',
//     completionDate: '28.2.2024',
//     creator: 'J. Novák',
//     responsiblePerson: 'P. Svoboda',
//     source: 'IT stratégia 2024',
//   },
  
//   // Level 2 - Children of root tasks
//   {
//     id: '1-1',
//     name: 'Spracovanie a vyhodnotenie nových žiadostí o majetkové vysporiadania',
//     origin: '12.2.2024',
//     priority: 'medium',
//     status: 'Hotová',
//     completionDate: '12.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'M. Hrnčiarová',
//     source: 'Porada vedenia 2024/43',
//     parentId: '1'
//   },
//   {
//     id: '1-2',
//     name: 'Kontrola kompletnosti dokumentácie a súladu s platnými predpismi',
//     origin: '13.2.2024',
//     priority: 'low',
//     status: 'Hotová',
//     completionDate: '15.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'A. Kováč',
//     source: 'Interný audit',
//     parentId: '1'
//   },
//   {
//     id: '2-1',
//     name: 'Príprava všetkých potrebných dokumentov pre ZOBZ konanie na úrade',
//     origin: '12.2.2024',
//     priority: 'high',
//     status: 'Zadaná',
//     completionDate: '20.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'B. Novotný',
//     source: 'Právne oddelenie',
//     parentId: '2'
//   },
//   {
//     id: '3-1',
//     name: 'Aktualizácia operačných systémov a bezpečnostné patche serverov',
//     origin: '15.2.2024',
//     priority: 'high',
//     status: 'Nedokončená',
//     completionDate: '25.2.2024',
//     creator: 'J. Novák',
//     responsiblePerson: 'P. Svoboda',
//     source: 'Bezpečnostný audit',
//     parentId: '3'
//   },
  
//   // Level 3 - Grandchildren
//   {
//     id: '1-1-1',
//     name: 'Vyplnenie požadovaných formulárov a príloh podľa metodického pokynu',
//     origin: '12.2.2024',
//     priority: 'medium',
//     status: 'Hotová',
//     completionDate: '12.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'M. Hrnčiarová',
//     source: 'Štandardný proces',
//     parentId: '1-1'
//   },
//   {
//     id: '1-2-1',
//     name: 'Detailná kontrola zmlúv, dodatkov a súvisiacich právnych dokumentov',
//     origin: '13.2.2024',
//     priority: 'medium',
//     status: 'Hotová',
//     completionDate: '14.2.2024',
//     creator: 'A. Kováč',
//     responsiblePerson: 'A. Kováč',
//     source: 'Právne predpisy',
//     parentId: '1-2'
//   },
//   {
//     id: '2-1-1',
//     name: 'Systematický zber a triedenie všetkých relevantných podkladových dokumentov',
//     origin: '12.2.2024',
//     priority: 'medium',
//     status: 'Hotová',
//     completionDate: '18.2.2024',
//     creator: 'B. Novotný',
//     responsiblePerson: 'C. Veselý',
//     source: 'Archív',
//     parentId: '2-1'
//   },
//   {
//     id: '3-1-1',
//     name: 'Zálohovanie kritických dát pred implementáciou systémových zmien',
//     origin: '15.2.2024',
//     priority: 'high',
//     status: 'Hotová',
//     completionDate: '16.2.2024',
//     creator: 'P. Svoboda',
//     responsiblePerson: 'P. Svoboda',
//     source: 'Bezpečnostný protokol',
//     parentId: '3-1'
//   },
  
//   // Level 4 - Great-grandchildren
//   {
//     id: '1-1-1-1',
//     name: 'Overenie správnosti a úplnosti všetkých zadaných údajov v systéme',
//     origin: '12.2.2024',
//     priority: 'low',
//     status: 'Hotová',
//     completionDate: '12.2.2024',
//     creator: 'M. Hrnčiarová',
//     responsiblePerson: 'D. Krásny',
//     source: 'Kvalita dát',
//     parentId: '1-1-1'
//   },
//   {
//     id: '2-1-1-1',
//     name: 'Digitalizácia papierových dokumentov a ich konverzia do elektronickej podoby',
//     origin: '12.2.2024',
//     priority: 'medium',
//     status: 'Zadaná',
//     completionDate: '19.2.2024',
//     creator: 'C. Veselý',
//     responsiblePerson: 'E. Múdry',
//     source: 'Digitálna transformácia',
//     parentId: '2-1-1'
//   },
//   {
//     id: '3-1-1-1',
//     name: 'Komplexný test integrity dátových súborov po migračnom procese',
//     origin: '15.2.2024',
//     priority: 'high',
//     status: 'Nedokončená',
//     completionDate: '17.2.2024',
//     creator: 'P. Svoboda',
//     responsiblePerson: 'F. Technik',
//     source: 'QA proces',
//     parentId: '3-1-1'
//   },
  
//   // Level 5 - Great-great-grandchildren
//   {
//     id: '1-1-1-1-1',
//     name: 'Finálna kontrola pred odoslaním a schválenie zodpovednou osobou',
//     origin: '12.2.2024',
//     priority: 'low',
//     status: 'Hotová',
//     completionDate: '12.2.2024',
//     creator: 'D. Krásny',
//     responsiblePerson: 'D. Krásny',
//     source: 'Štandardná procedúra',
//     parentId: '1-1-1-1'
//   },
//   {
//     id: '2-1-1-1-1',
//     name: 'OCR spracovanie naskenovaných dokumentov pomocou umelej inteligencie',
//     origin: '12.2.2024',
//     priority: 'medium',
//     status: 'Zadaná',
//     completionDate: '20.2.2024',
//     creator: 'E. Múdry',
//     responsiblePerson: 'G. Robot',
//     source: 'AI nástroje',
//     parentId: '2-1-1-1'
//   },
//   {
//     id: '3-1-1-1-1',
//     name: 'Checksum verifikácia a validácia integrity súborov podľa štandardov',
//     origin: '15.2.2024',
//     priority: 'high',
//     status: 'Nedokončená',
//     completionDate: '17.2.2024',
//     creator: 'F. Technik',
//     responsiblePerson: 'F. Technik',
//     source: 'Technický štandard',
//     parentId: '3-1-1-1'
//   }
// ];