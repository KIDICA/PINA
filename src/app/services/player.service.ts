import { Injectable } from '@angular/core';
import { PlayerData } from '@app/core/model/PlayerData';
import { AzureVisionFaceApiService } from './azureVisionFaceApi.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlayerService {

  private readonly names =
    ['Carlo Abate', 'George Abecassis', 'Kenny Acheson', 'Andrea de Adamich', 'Philippe Adams', 'Walt Ader', 'Kurt Adolff',
      'Fred Agabashian', 'Kurt Ahrens, Jr.', 'Christijan Albers', 'Alexander Albon', 'Michele Alboreto', 'Jean Alesi',
      'Jaime Alguersuari', 'Philippe Alliot', 'Cliff Allison', 'Fernando Alonso', 'Giovanna Amati', 'George Amick',
      'Red Amick', 'Chris Amon', 'Bob Anderson', 'Conny Andersson', 'Mario Andretti', 'Michael Andretti',
      'Keith Andrews', 'Elio de Angelis', 'Marco Apicella', 'Mário de Araújo Cabral', 'Frank Armi', 'Chuck Arnold',
      'René Arnoux', 'Peter Arundell', 'Alberto Ascari', 'Peter Ashdown', 'Ian Ashley', 'Gerry Ashmore',
      'Bill Aston', 'Richard Attwood', 'Manny Ayulo', 'Luca Badoer', 'Giancarlo Baghetti', 'Julian Bailey',
      'Mauro Baldi', 'Bobby Ball', 'Marcel Balsa', 'Lorenzo Bandini', 'Henry Banks', 'Fabrizio Barbazza',
      'John Barber', 'Skip Barber', 'Paolo Barilla', 'Rubens Barrichello', 'Michael Bartels', 'Edgar Barth',
      'Giorgio Bassi', 'Erwin Bauer', 'Zsolt Baumgartner', 'Élie Bayol', 'Don Beauman', 'Karl-Günther Bechem',
      'Jean Behra', 'Derek Bell', 'Stefan Bellof', 'Paul Belmondo', 'Tom Belsø', 'Jean-Pierre Beltoise',
      'Olivier Beretta', 'Allen Berg', 'Georges Berger', 'Gerhard Berger', 'Éric Bernard', 'Enrique Bernoldi',
      'Enrico Bertaggia', 'Tony Bettenhausen', 'Mike Beuttler', 'Birabongse Bhanudej', 'Jules Bianchi', 'Lucien Bianchi',
      'Gino Bianco', 'Hans Binder', 'Clemente Biondetti', 'Pablo Birger', 'Art Bisch', 'Harry Blanchard',
      'Michael Bleekemolen', 'Alex Blignaut', 'Trevor Blokdyk', 'Mark Blundell', 'Raul Boesel', 'Menato Boffa',
      'Bob Bondurant', 'Felice Bonetto', 'Jo Bonnier', 'Roberto Bonomi', 'Juan Manuel Bordeu', 'Slim Borgudd',
      'Luki Botha', 'Valtteri Bottas', 'Jean-Christophe Boullion', 'Sébastien Bourdais', 'Thierry Boutsen', 'Johnny Boyd',
      'David Brabham', 'Gary Brabham', 'Jack Brabham', 'Bill Brack', 'Ernesto Brambilla', 'Vittorio Brambilla',
      'Toni Branca', 'Gianfranco Brancatelli', 'Eric Brandon', 'Don Branson', 'Tom Bridger', 'Tony Brise',
      'Chris Bristow', 'Peter Broeker', 'Tony Brooks', 'Alan Brown', 'Walt Brown', 'Warwick Brown',
      'Adolf Brudes', 'Martin Brundle', 'Gianmaria Bruni', 'Jimmy Bryan', 'Clemar Bucci', 'Ronnie Bucknum',
      'Ivor Bueb', 'Sébastien Buemi', 'Luiz Bueno', 'Ian Burgess', 'Luciano Burti', 'Roberto Bussinello',
      'Jenson Button', 'Tommy Byrne', 'Giulio Cabianca', 'Phil Cade', 'Alex Caffi', 'John Campbell-Jones',
      'Adrián Campos', 'John Cannon', 'Eitel Cantoni', 'Bill Cantrell', 'Ivan Capelli', 'Piero Carini',
      'Duane Carter', 'Eugenio Castellotti', 'Johnny Cecotto', 'Andrea de Cesaris', 'François Cevert', 'Eugène Chaboud',
      'Jay Chamberlain', 'Karun Chandhok', 'Alain de Changy', 'Colin Chapman', 'Dave Charlton', 'Pedro Matos Chaves',
      'Bill Cheesbourg', 'Eddie Cheever', 'Andrea Chiesa', 'Max Chilton', 'Ettore Chimeri', 'Louis Chiron',
      'Joie Chitwood', 'Bob Christie', 'Johnny Claes', 'David Clapham', 'Jim Clark', 'Kevin Cogan',
      'Peter Collins', 'Bernard Collomb', 'Alberto Colombo', 'Érik Comas', 'Franco Comotti', 'George Connor',
      'George Constantine', 'John Cordts', 'David Coulthard', 'Piers Courage', 'Chris Craft', 'Jim Crawford',
      'Ray Crawford', 'Alberto Crespo', 'Antonio Creus', 'Larry Crockett', 'Tony Crook', 'Art Cross',
      'Geoffrey Crossley', 'Jérôme de Ambrosio', 'Chuck Daigh', 'Yannick Dalmas', 'Derek Daly', 'Christian Danner',
      'Jorge Daponte', 'Anthony Davidson', 'Jimmy Davies', 'Colin Davis', 'Jimmy Daywalt', 'Jean-Denis Délétraz',
      'Patrick Depailler', 'Pedro Diniz', 'Duke Dinsmore', 'Frank Dochnal', 'José Dolhem', 'Martin Donnelly',
      'Mark Donohue', 'Robert Doornbos', 'Ken Downing', 'Bob Drake', 'Paddy Driver', 'Piero Drogo',
      'Bernard de Dryver', 'Johnny Dumfries', 'Geoff Duke', 'Len Duncan', 'Piero Dusio', 'George Eaton',
      'Bernie Ecclestone', 'Don Edmunds', 'Guy Edwards', 'Vic Elford', 'Ed Elisian', 'Paul Emery',
      'Tomáš Enge', 'Paul England', 'Marcus Ericsson', 'Harald Ertl', 'Nasif Estéfano', 'Philippe Étancelin',
      'Bob Evans', 'Corrado Fabi', 'Teo Fabi', 'Pascal Fabre', 'Carlo Facetti', 'Luigi Fagioli',
      'Jack Fairman', 'Juan Manuel Fangio', 'Nino Farina', 'Walt Faulkner', 'William Ferguson', 'Maria Teresa de Filippis',
      'Ralph Firman', 'Ludwig Fischer', 'Rudi Fischer', 'Mike Fisher', 'Giancarlo Fisichella', 'John Fitch',
      'Christian Fittipaldi', 'Emerson Fittipaldi', 'Wilson Fittipaldi', 'Theo Fitzau', 'Pat Flaherty', 'Jan Flinterman',
      'Ron Flockhart', 'Myron Fohr', 'Gregor Foitek', 'George Follmer', 'George Fonder', 'Norberto Fontana',
      'Asdrúbal Fontes Bayardo', 'Carl Forberg', 'Gene Force', 'Franco Forini', 'Philip Fotheringham-Parker', 'A. J. Foyt',
      'Giorgio Francia', 'Don Freeland', 'Heinz-Harald Frentzen', 'Paul Frère', 'Patrick Friesacher', 'Joe Fry',
      'Hiroshi Fushida', 'Beppe Gabbiani', 'Bertrand Gachot', 'Patrick Gaillard', 'Divina Galica', 'Nanni Galli',
      'Oscar Alfredo Gálvez', 'Fred Gamble', 'Howden Ganley', 'Giedo van der Garde', 'Frank Gardner', 'Billy Garrett',
      'Jo Gartner', 'Pierre Gasly', 'Tony Gaze', 'Olivier Gendebien', 'Marc Gené', 'Elmer George',
      'Bob Gerard', 'Gerino Gerini', 'Peter Gethin', 'Piercarlo Ghinzani', 'Bruno Giacomelli', 'Dick Gibson',
      'Richie Ginther', 'Antonio Giovinazzi', 'Yves Giraud-Cabantous', 'Ignazio Giunti', 'Timo Glock', 'Helm Glöckler',
      'Paco Godia', 'Carel Godin de Beaufort', 'Christian Goethals', 'Paul Goldsmith', 'José Froilán González', 'Óscar González',
      'Aldo Gordini', 'Horace Gould', 'Jean-Marc Gounon', 'Emmanuel de Graffenried', 'Lucas di Grassi', 'Cecil Green',
      'Keith Greene', 'Masten Gregory', 'Cliff Griffith', 'Georges Grignard', 'Bobby Grim', 'Romain Grosjean',
      'Olivier Grouillard', 'Brian Gubby', 'André Guelfi', 'Miguel Ángel Guerra', 'Roberto Guerrero', 'Maurício Gugelmin',
      'Dan Gurney', 'Esteban Gutiérrez', 'Hubert Hahne', 'Mike Hailwood', 'Mika Häkkinen', 'Bruce Halford',
      'Jim Hall', 'Duncan Hamilton', 'Lewis Hamilton', 'David Hampshire', 'Sam Hanks', 'Walt Hansgen',
      'Mike Harris', 'Cuth Harrison', 'Brian Hart', 'Brendon Hartley', 'Gene Hartley', 'Rio Haryanto',
      'Masahiro Hasemi', 'Naoki Hattori', 'Paul Hawkins', 'Mike Hawthorn', 'Boy Hayje', 'Willi Heeks',
      'Nick Heidfeld', 'Theo Helfrich', 'Mack Hellings', 'Brian Henton', 'Johnny Herbert', 'Al Herman',
      'Hans Herrmann', 'François Hesnault', 'Hans Heyer', 'Damon Hill', 'Graham Hill', 'Phil Hill',
      'Peter Hirt', 'David Hobbs', 'Gary Hocking', 'Ingo Hoffmann', 'Bill Holland', 'Jackie Holmes',
      'Bill Homeier', 'Kazuyoshi Hoshino', 'Jerry Hoyt', 'Nico Hülkenberg', 'Denny Hulme', 'James Hunt',
      'Jim Hurtubise', 'Gus Hutchison', 'Jacky Ickx', 'Yuji Ide', 'Jesús Iglesias', 'Taki Inoue',
      'Innes Ireland', 'Eddie Irvine', 'Chris Irwin', 'Jean-Pierre Jabouille', 'Jimmy Jackson', 'Joe James',
      'John James', 'Jean-Pierre Jarier', 'Max Jean', 'Stefan Johansson', 'Eddie Johnson', 'Leslie Johnson',
      'Bruce Johnstone', 'Alan Jones', 'Tom Jones', 'Juan Jover', 'Oswald Karch', 'Narain Karthikeyan',
      'Ukyo Katayama', 'Ken Kavanagh', 'Rupert Keegan', 'Eddie Keizan', 'Al Keller', 'Joe Kelly',
      'David Kennedy', 'Loris Kessel', 'Bruce Kessler', 'Nicolas Kiesa', 'Leo Kinnunen', 'Danny Kladis',
      'Hans Klenk', 'Peter de Klerk', 'Christian Klien', 'Karl Kling', 'Ernst Klodwig', 'Kamui Kobayashi',
      'Helmuth Koinigg', 'Heikki Kovalainen', 'Mikko Kozarowitzky', 'Willi Krakau', 'Rudolf Krause', 'Robert Kubica',
      'Kurt Kuhnke', 'Masami Kuwashima', 'Daniil Kvyat', 'Robert La Caze', 'Jacques Laffite', 'Franck Lagorce',
      'Jan Lammers', 'Pedro Lamy', 'Chico Landi', 'Hermann Lang', 'Claudio Langes', 'Nicola Larini',
      'Oscar Larrauri', 'Gérard Larrousse', 'Jud Larson', 'Niki Lauda', 'Roger Laurent', 'Giovanni Lavaggi',
      'Chris Lawrence', 'Charles Leclerc', 'Michel Leclère', 'Neville Lederle', 'Geoff Lees', 'Gijs van Lennep',
      'Arthur Legat', 'JJ Lehto', 'Lamberto Leoni', 'Les Leston', 'Pierre Levegh', 'Bayliss Levrett',
      'Jackie Lewis', 'Stuart Lewis-Evans', 'Guy Ligier', 'Andy Linden', 'Roberto Lippi', 'Vitantonio Liuzzi',
      'Dries van der Lof', 'Lella Lombardi', 'Ricardo Londoño', 'Ernst Loof', 'André Lotterer', 'Henri Louveau',
      'John Love', 'Pete Lovely', 'Roger Loyer', 'Jean Lucas', 'Jean Lucienbonnet', 'Brett Lunger',
      'Mike MacDowel', 'Herbert MacKay-Fraser', 'Bill Mackey', 'Lance Macklin', 'Damien Magee', 'Tony Maggs',
      'Mike Magill', 'Umberto Maglioli', 'Jan Magnussen', 'Kevin Magnussen', 'Guy Mairesse', 'Willy Mairesse',
      'Pastor Maldonado', 'Nigel Mansell', 'Sergio Mantovani', 'Johnny Mantz', 'Robert Manzon', 'Onofre Marimón',
      'Helmut Marko', 'Tarso Marques', 'Leslie Marr', 'Tony Marsh', 'Eugène Martin', 'Pierluigi Martini',
      'Jochen Mass', 'Felipe Massa', 'Cristiano da Matta', 'Michael May', 'Timmy Mayer', 'François Mazet',
      'Gastón Mazzacane', 'Kenneth McAlpine', 'Perry McCarthy', 'Ernie McCoy', 'Johnny McDowell', 'Jack McGrath',
      'Brian McGuire', 'Bruce McLaren', 'Allan McNish', 'Graham McRae', 'Jim McWithey', 'Carlos Menditeguy',
      'Roberto Merhi', 'Harry Merkel', 'Arturo Merzario', 'Roberto Mieres', 'François Migault', 'John Miles',
      'Ken Miles', 'André Milhoux', 'Chet Miller', 'Gerhard Mitter', 'Stefano Modena', 'Thomas Monarch',
      'Franck Montagny', 'Tiago Monteiro', 'Andrea Montermini', 'Peter Monteverdi', 'Robin Montgomerie-Charrington', 'Juan Pablo Montoya',
      'Gianni Morbidelli', 'Roberto Moreno', 'Dave Morgan', 'Silvio Moser', 'Bill Moss', 'Stirling Moss',
      'Gino Munaron', 'David Murray', 'Luigi Musso', 'Kazuki Nakajima', 'Satoru Nakajima', 'Shinji Nakano',
      'Duke Nalon', 'Alessandro Nannini', 'Emanuele Naspetti', 'Felipe Nasr', 'Massimo Natili', 'Brian Naylor',
      'Mike Nazaruk', 'Tiff Needell', 'Jac Nellemann', 'Patrick Nève', 'John Nicholson', 'Cal Niday',
      'Helmut Niedermayr', 'Brausch Niemann', 'Gunnar Nilsson', 'Hideki Noda', 'Lando Norris', 'Rodney Nuckey',
      'Robert OBrien', 'Esteban Ocon', 'Pat OConnor', 'Casimiro de Oliveira', 'Jackie Oliver', 'Danny Ongais',
      'Rikky von Opel', 'Karl Oppitzhauser', 'Fritz de Orey', 'Arthur Owen', 'Carlos Pace', 'Nello Pagani',
      'Riccardo Paletti', 'Torsten Palm', 'Jolyon Palmer', 'Jonathan Palmer', 'Olivier Panis', 'Giorgio Pantano',
      'Max Papis', 'Mike Parkes', 'Reg Parnell', 'Tim Parnell', 'Johnnie Parsons', 'Riccardo Patrese',
      'Al Pease', 'Roger Penske', 'Cesare Perdisa', 'Sergio Pérez', 'Luis Pérez-Sala', 'Larry Perkins',
      'Henri Pescarolo', 'Alessandro Pesenti-Rossi', 'Josef Peters', 'Ronnie Peterson', 'Vitaly Petrov', 'Alfredo Pián',
      'Charles Pic', 'François Picard', 'Ernie Pieterse', 'Paul Pietsch', 'André Pilette', 'Teddy Pilette',
      'Luigi Piotti', 'David Piper', 'Nelson Piquet', 'Nelson Piquet Jr.', 'Renato Pirocchi', 'Didier Pironi',
      'Emanuele Pirro', 'Antônio Pizzonia', 'Eric van de Poele', 'Jacques Pollet', 'Ben Pon', 'Dennis Poore',
      'Alfonso de Portago', 'Sam Posey', 'Charles Pozzi', 'Jackie Pretorius', 'Ernesto Prinoth', 'David Prophet',
      'Alain Prost', 'Tom Pryce', 'David Purley', 'Clive Puzey', 'Dieter Quester', 'Ian Raby',
      'Bobby Rahal', 'Kimi Räikkönen', 'Hermano da Silva Ramos', 'Pierre-Henri Raphanel', 'Dick Rathmann', 'Jim Rathmann',
      'Roland Ratzenberger', 'Héctor Rebaque', 'Brian Redman', 'Jimmy Reece', 'Ray Reed', 'Alan Rees',
      'Clay Regazzoni', 'Paul di Resta', 'Carlos Reutemann', 'Lance Reventlow', 'Peter Revson', 'John Rhodes',
      'Alex Ribeiro', 'Daniel Ricciardo', 'Ken Richardson', 'Fritz Riess', 'Jim Rigsby', 'Jochen Rindt',
      'John Riseley-Prichard', 'Giovanni de Riu', 'Richard Robarts', 'Pedro Rodríguez', 'Ricardo Rodríguez', 'Alberto Rodriguez Larreta',
      'Franco Rol', 'Alan Rollinson', 'Tony Rolt', 'Bertil Roos', 'Pedro de la Rosa', 'Keke Rosberg',
      'Nico Rosberg', 'Mauri Rose', 'Louis Rosier', 'Ricardo Rosset', 'Alexander Rossi', 'Huub Rothengatter',
      'Basil van Rooyen', 'Lloyd Ruby', 'Jean-Claude Rudaz', 'George Russell', 'Eddie Russo', 'Paul Russo',
      'Troy Ruttman', 'Peter Ryan', 'Eddie Sachs', 'Bob Said', 'Carlos Sainz Jr.', 'Eliseo Salazar',
      'Mika Salo', 'Roy Salvadori', 'Consalvo Sanesi', 'Stéphane Sarrazin', 'Takuma Sato', 'Carl Scarborough',
      'Ludovico Scarfiotti', 'Giorgio Scarlatti', 'Ian Scheckter', 'Jody Scheckter', 'Harry Schell', 'Tim Schenken',
      'Albert Scherrer', 'Domenico Schiattarella', 'Heinz Schiller', 'Bill Schindler', 'Jean-Louis Schlesser', 'Jo Schlesser',
      'Bernd Schneider', 'Rudolf Schoeller', 'Rob Schroeder', 'Michael Schumacher', 'Ralf Schumacher', 'Vern Schuppan',
      'Adolfo Schwelm Cruz', 'Bob Scott', 'Archie Scott Brown', 'Piero Scotti', 'Wolfgang Seidel', 'Günther Seiffert',
      'Ayrton Senna', 'Bruno Senna', 'Dorino Serafini', 'Chico Serra', 'Doug Serrurier', 'Johnny Servoz-Gavin',
      'Tony Settember', 'Hap Sharp', 'Brian Shawe-Taylor', 'Carroll Shelby', 'Tony Shelly', 'Jo Siffert',
      'André Simon', 'Sergey Sirotkin', 'Rob Slotemaker', 'Moisés Solana', 'Alex Soler-Roig', 'Raymond Sommer',
      'Vincenzo Sospiri', 'Stephen South', 'Mike Sparken', 'Scott Speed', 'Mike Spence', 'Alan Stacey',
      'Gaetano Starrabba', 'Will Stevens', 'Chuck Stevenson', 'Ian Stewart', 'Jackie Stewart', 'Jimmy Stewart',
      'Siegfried Stohr', 'Rolf Stommelen', 'Philippe Streiff', 'Lance Stroll', 'Hans Stuck', 'Hans-Joachim Stuck',
      'Otto Stuppacher', 'Danny Sullivan', 'Marc Surer', 'John Surtees', 'Andy Sutcliffe', 'Adrian Sutil',
      'Len Sutton', 'Aguri Suzuki', 'Toshio Suzuki', 'Jacques Swaters', 'Bob Sweikert', 'Toranosuke Takagi',
      'Noritake Takahara', 'Kunimitsu Takahashi', 'Patrick Tambay', 'Luigi Taramazzo', 'Gabriele Tarquini', 'Piero Taruffi',
      'Dennis Taylor', 'Henry Taylor', 'John Taylor', 'Mike Taylor', 'Trevor Taylor', 'Marshall Teague',
      'Shorty Templeman', 'Max de Terra', 'André Testut', 'Mike Thackwell', 'Alfonso Thiele', 'Eric Thompson',
      'Johnny Thomson', 'Leslie Thorne', 'Bud Tingelstad', 'Sam Tingle', 'Desmond Titterington', 'Johnnie Tolan',
      'Alejandro de Tomaso', 'Charles de Tornaco', 'Tony Trimmer', 'Maurice Trintignant', 'Wolfgang von Trips', 'Jarno Trulli',
      'Esteban Tuero', 'Guy Tunmer', 'Jack Turner', 'Toni Ulmen', 'Bobby Unser', 'Jerry Unser Jr.',
      'Alberto Uria', 'Nino Vaccarella', 'Stoffel Vandoorne', 'Bob Veith', 'Jean-Éric Vergne', 'Jos Verstappen',
      'Max Verstappen', 'Sebastian Vettel', 'Gilles Villeneuve', 'Jacques Villeneuve', 'Jacques Villeneuve, Sr.', 'Luigi Villoresi',
      'Emilio de Villota', 'Ottorino Volonterio', 'Jo Vonlanthen', 'Ernie de Vos', 'Bill Vukovich', 'Syd van der Vyver',
      'David Walker', 'Peter Walker', 'Lee Wallard', 'Heini Walter', 'Rodger Ward', 'Derek Warwick',
      'John Watson', 'Spider Webb', 'Mark Webber', 'Pascal Wehrlein', 'Volker Weidler', 'Wayne Weiler',
      'Karl Wendlinger', 'Peter Westbury', 'Chuck Weyant', 'Ken Wharton', 'Ted Whiteaway', 'Graham Whitehead',
      'Peter Whitehead', 'Bill Whitehouse', 'Robin Widdows', 'Eppie Wietzes', 'Mike Wilds', 'Jonathan Williams',
      'Roger Williamson', 'Dempsey Wilson', 'Desiré Wilson', 'Justin Wilson', 'Vic Wilson', 'Joachim Winkelhock',
      'Manfred Winkelhock', 'Markus Winkelhock', 'Reine Wisell', 'Roelof Wunderink', 'Alexander Wurz', 'Sakon Yamamoto',
      'Alex Yoong', 'Alex Zanardi', 'Emilio Zapico', 'Ricardo Zonta', 'Renzo Zorzi', 'Ricardo Zunino'];

  constructor(
    private faceApiService: AzureVisionFaceApiService
  ) { }

  generateRandomName(personGroupId: string) {
    return this.findAllPlayers(personGroupId)
      .then(players => {
        while (true) {
          const temp = this.selectRandom(this.names);
          if (this.noPlayersWithName(temp, players)) {
            return Promise.resolve(temp);
          }
        }
      });
  }

  private noPlayersWithName(name: string, players: PlayerData[]) {
    return players.find(player => player.name === name) === undefined;
  }

  private selectRandom(someArray) {
    return someArray[Math.floor(Math.random() * someArray.length)];
  }

  buildPlayerFrom(singleDetectFaceResponse): PlayerData {
    return new PlayerData().knownPlayerFound(
      singleDetectFaceResponse['personId'],
      singleDetectFaceResponse['name'],
      singleDetectFaceResponse['personData']);
  }

  findPlayerFor(personGroupId: string, personId: string): Promise<PlayerData> {
    return this.faceApiService.findPerson(personGroupId, personId)
      .pipe(map(this.responseToPlayerMapper))
      .toPromise();
  }

  updatePlayer(personGroupId: string, playerData: PlayerData) {
    return this.faceApiService.updatePerson(
      personGroupId,
      playerData.personId,
      playerData.name,
      playerData.score.toString()
    ).toPromise();
  }

  findAllPlayers(personGroupId: string) {
    return this.faceApiService
      .findPersons(personGroupId)
      .toPromise()
      .then((responses: []) => responses.map(this.responseToPlayerMapper));
  }

  findTop10HighScorePlayersIncluding(personGroupId: string, playerOne: PlayerData, playerTwo: PlayerData) {
    return this.faceApiService
      .findPersons(personGroupId)
      .toPromise()
      .then((respones: any[]) => respones.map(this.responseToPlayerMapper))
      .then((players: PlayerData[]) => {
        this.sort(players);
        return players;
      })
      .then((players: PlayerData[]) => players.map(this.advancedMapper(playerOne, playerTwo)))
      .then((output: any[]) => output.filter(o => o.mayIgnore === false));
  }

  private advancedMapper = (pOne: PlayerData, pTwo: PlayerData) => (player: PlayerData, index: number, players: PlayerData[]) => {
    return {
      'index': index + 1,
      'player': player,
      'mayIgnore': index > 9,
      'isPlayerOne': pOne.personId === player.personId,
      'isPlayerTwo': pTwo.personId === player.personId
    };
  }

  private responseToPlayerMapper = response => {
    return new PlayerData().knownPlayerFound(response['personId'], response['name'], response['userData']);
  }

  private sort(playerData: PlayerData[]) {
    playerData.sort((a, b) => b.score - a.score);
  }

}
