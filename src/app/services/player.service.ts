import { Injectable } from '@angular/core';
import { PlayerData } from '@app/core/model/PlayerData';
import { AzureVisionFaceApiService } from './azureVisionFaceApi.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlayerService {

  private readonly names = ['Abe Sapien', 'Abin Sur', 'Abomination', 'Abraxas', 'Absorbing Man', 'Adam Monroe', 'Adam Strange',
  'Agent 13', 'Agent Bob', 'Agent Zero', 'Air-Walker', 'Ajax', 'Alan Scott', 'Alex Mercer', 'Alex Woolsly', 'Alfred Pennyworth',
  'Alien', 'Allan Quatermain', 'Amazo', 'Ammo', 'Ando Masahashi', 'Angel', 'Angel Dust', 'Angel Salvadore', 'Angela', 'Animal Man',
  'Annihilus', 'Ant-Man', 'Anti-Monitor', 'Anti-Spawn', 'Anti-Venom', 'Apocalypse', 'Aquababy', 'Aqualad', 'Aquaman', 'Arachne',
  'Archangel', 'Arclight', 'Ardina', 'Ares', 'Ariel', 'Armor', 'Arsenal', 'Astro Boy', 'Atlas', 'Atom', 'Atom Girl', 'Aurora',
  'Azazel', 'Azrael', 'Aztar', 'Bane', 'Banshee', 'Bantam', 'Batgirl', 'Batman', 'Battlestar', 'Beak', 'Beast', 'Beast Boy',
  'Beetle', 'Ben 10', 'Beta Ray Bill', 'Beyonder', 'Big Barda', 'Big Daddy', 'Big Man', 'Bill Harken', 'Billy Kincaid', 'Binary',
  'Bionic Woman', 'Bird-Brain', 'Bird-Man', 'Birdman', 'Bishop', 'Bizarro', 'Black Abbott', 'Black Adam', 'Black Bolt', 'Black Canary',
  'Black Cat', 'Black Flash', 'Black Goliath', 'Black Lightning', 'Black Mamba', 'Black Manta', 'Black Panther', 'Black Widow', 'Blackout',
  'Blackwing', 'Blackwulf', 'Blade', 'Blaquesmith', 'Bling!', 'Blink', 'Blizzard', 'Blob', 'Bloodaxe', 'Bloodhawk', 'Bloodwraith',
  'Blue Beetle', 'Boba Fett', 'Bolt', 'Bomb Queen', 'Boom-Boom', 'Boomer', 'Booster Gold', 'Box', 'Brainiac', 'Brother Voodoo',
  'Brundlefly', 'Buffy', 'Bullseye', 'Bumblebee', 'Bumbleboy', 'Bushido', 'Cable', 'Callisto', 'Cameron Hicks', 'Cannonball',
  'Captain America', 'Captain Atom', 'Captain Britain', 'Captain Cold', 'Captain Epic', 'Captain Hindsight', 'Captain Marvel',
  'Captain Midnight', 'Captain Planet', 'Captain Universe', 'Carnage', 'Cat', 'Catwoman', 'Cecilia Reyes', 'Century', 'Cerebra',
  'Chamber', 'Chameleon', 'Changeling', 'Cheetah', 'Chromos', 'Chuck Norris', 'Citizen Steel', 'Claire Bennet', 'Clea', 'Cloak',
  'Clock King', 'Cogliostro', 'Colin Wagner', 'Colossal Boy', 'Colossus', 'Copycat', 'Corsair', 'Cottonmouth', 'Crimson Crusader',
  'Crimson Dynamo', 'Crystal', 'Curse', 'Cy-Gor', 'Cyborg', 'Cyclops', 'Cypher', 'Dagger', 'Danny Cooper', 'Daphne Powell', 'Daredevil',
  'Darkhawk', 'Darkman', 'Darkseid', 'Darkside', 'Darkstar', 'Darth Maul', 'Darth Vader', 'Dash', 'Data', 'Dazzler', 'Deadman', 'Deadpool',
  'Deadshot', 'Deathlok', 'Deathstroke', 'Demogoblin', 'Destroyer', 'Diamondback', 'DL Hawkins', 'Doc Samson', 'Doctor Doom', 'Doctor Fate',
  'Doctor Octopus', 'Doctor Strange', 'Domino', 'Donatello', 'Donna Troy', 'Doomsday', 'Doppelganger', 'Dormammu', 'Dr Manhattan',
  'Drax the Destroyer', 'Ego', 'Elastigirl', 'Electro', 'Elektra', 'Elle Bishop', 'Elongated Man', 'Emma Frost', 'Enchantress', 'Energy',
  'ERG-1', 'Ethan Hunt', 'Etrigan', 'Evil Deadpool', 'Evilhawk', 'Exodus', 'Fabian Cortez', 'Falcon', 'Faora', 'Feral', 'Fighting Spirit',
  'Fin Fang Foom', 'Firebird', 'Firelord', 'Firestar', 'Firestorm', 'Fixer', 'Flash', 'Flash Gordon', 'Forge', 'Franklin Richards',
  'Franklin Storm', 'Frenzy', 'Frigga', 'Galactus', 'Gambit', 'Gamora', 'Garbage Man', 'Gary Bell', 'General Zod', 'Genesis',
  'Ghost Rider', 'Giant-Man', 'Giganta', 'Gladiator', 'Goblin Queen', 'Godzilla', 'Gog', 'Goku', 'Goliath', 'Gorilla Grodd',
  'Granny Goodness', 'Gravity', 'Greedo', 'Green Arrow', 'Green Goblin', 'Groot', 'Guardian', 'Guy Gardner', 'Hal Jordan', 'Han Solo',
  'Hancock', 'Harley Quinn', 'Harry Potter', 'Havok', 'Hawk', 'Hawkeye', 'Hawkgirl', 'Hawkman', 'Hawkwoman', 'Heat Wave', 'Hela',
  'Hellboy', 'Hellcat', 'Hellstorm', 'Hercules', 'Hiro Nakamura', 'Hit-Girl', 'Hobgoblin', 'Hollow', 'Hope Summers', 'Howard the Duck',
  'Hulk', 'Human Torch', 'Huntress', 'Husk', 'Hybrid', 'Hydro-Man', 'Hyperion', 'Iceman', 'Impulse', 'Indiana Jones', 'Indigo', 'Ink',
  'Invisible Woman', 'Iron Fist', 'Iron Man', 'Iron Monger', 'Isis', 'Jack Bauer', 'Jack of Hearts', 'Jack-Jack', 'James Bond',
  'James T. Kirk', 'Jar Jar Binks', 'Jason Bourne', 'Jean Grey', 'Jean-Luc Picard', 'Jennifer Kale', 'Jesse Quick', 'Jessica Cruz',
  'Jessica Jones', 'Jessica Sanders', 'Jigsaw', 'Jim Powell', 'JJ Powell', 'Johann Krauss', 'John Constantine', 'John Stewart',
  'John Wraith', 'Joker', 'Jolt', 'Jubilee', 'Judge Dredd', 'Juggernaut', 'Junkpile', 'Justice', 'Jyn Erso', 'K-2SO', 'Kang', 'Karate Kid',
  'Kathryn Janeway', 'Katniss Everdeen', 'Kevin 11', 'Kick-Ass', 'Kid Flash', 'Killer Croc', 'Killer Frost', 'Kilowog', 'King Kong',
  'King Shark', 'Kingpin', 'Klaw', 'Kool-Aid Man', 'Kraven the Hunter', 'Krypto', 'Kyle Rayner', 'Kylo Ren', 'Lady Bullseye',
  'Lady Deathstrike', 'Leader', 'Leech', 'Legion', 'Leonardo', 'Lex Luthor', 'Light Lass', 'Lightning Lad', 'Lightning Lord',
  'Living Brain', 'Living Tribunal', 'Liz Sherman', 'Lizard', 'Lobo', 'Loki', 'Longshot', 'Luke Cage', 'Luke Campbell', 'Luke Skywalker',
  'Luna', 'Lyja', 'Mach-IV', 'Machine Man', 'Magneto', 'Magog', 'Magus', 'Man of Miracles', 'Man-Bat', 'Man-Thing', 'Man-Wolf', 'Mandarin',
  'Mantis', 'Martian Manhunter', 'Marvel Girl', 'Master Brood', 'Master Chief', 'Match', 'Matt Parkman', 'Maverick', 'Maxima',
  'Maya Herrera', 'Medusa', 'Meltdown', 'Mephisto', 'Mera', 'Metallo', 'Metamorpho', 'Meteorite', 'Metron', 'Micah Sanders',
  'Michelangelo', 'Micro Lad', 'Mimic', 'Minna Murray', 'Misfit', 'Miss Martian', 'Mister Fantastic', 'Mister Freeze', 'Mister Knife',
  'Mister Mxyzptlk', 'Mister Sinister', 'Mister Zsasz', 'Mockingbird', 'MODOK', 'Mogo', 'Mohinder Suresh', 'Moloch', 'Molten Man',
  'Monarch', 'Monica Dawson', 'Moon Knight', 'Moonstone', 'Morlun', 'Morph', 'Moses Magnum', 'Mr Immortal', 'Mr Incredible',
  'Multiple Man', 'Mysterio', 'Mystique', 'Namor', 'Namora', 'Namorita', 'Naruto Uzumaki', 'Nathan Petrelli', 'Nebula',
  'Negasonic Teenage Warhead', 'Nick Fury', 'Nightcrawler', 'Nightwing', 'Niki Sanders', 'Nina Theroux', 'Northstar', 'Nova',
  'Odin', 'Offspring', 'Omega Red', 'Omniscient', 'One Punch Man', 'One-Above-All', 'Onslaught', 'Oracle', 'Osiris', 'Overtkill',
  'Ozymandias', 'Parademon', 'Paul Blart', 'Penance', 'Penguin', 'Peter Petrelli', 'Phantom', 'Phantom Girl', 'Phoenix', 'Plantman',
  'Plastic Lad', 'Plastic Man', 'Plastique', 'Poison Ivy', 'Polaris', 'Power Girl', 'Power Man', 'Predator', 'Professor X',
  'Professor Zoom', 'Proto-Goblin', 'Psylocke', 'Punisher', 'Purple Man', 'Pyro', 'Q', 'Quantum', 'Question', 'Quicksilver',
  'Quill', 'Ras Al Ghul', 'Rachel Pirzad', 'Rambo', 'Raphael', 'Raven', 'Ray', 'Red Arrow', 'Red Hood', 'Red Hulk', 'Red Mist',
  'Red Robin', 'Red Skull', 'Red Tornado', 'Renata Soliz', 'Rey', 'Rhino', 'Rick Flag', 'Riddler', 'Rip Hunter', 'Ripcord', 'Robin',
  'Rocket Raccoon', 'Rogue', 'Ronin', 'Rorschach', 'Sabretooth', 'Sage', 'Sandman', 'Sasquatch', 'Sauron', 'Savage Dragon', 'Scarecrow',
  'Scarlet Spider', 'Scarlet Witch', 'Scorpia', 'Scorpion', 'Sebastian Shaw', 'Sentry', 'Shadow King', 'Shadow Lass', 'Shadowcat',
  'Shang-Chi', 'Shatterstar', 'Shocker', 'Shriek', 'Shrinking Violet', 'Sif', 'Silk', 'Silk Spectre', 'Silver Surfer', 'Silverclaw',
  'Simon Baz', 'Sinestro', 'Siren', 'Siryn', 'Skaar', 'Snake-Eyes', 'Snowbird', 'Sobek', 'Solomon Grundy', 'Songbird', 'Space Ghost',
  'Spawn', 'Spectre', 'Speedball', 'Speedy', 'Spider-Carnage', 'Spider-Girl', 'Spider-Gwen', 'Spider-Man', 'Spider-Woman', 'Spock',
  'Spyke', 'Stacy X', 'Star-Lord', 'Stardust', 'Starfire', 'Stargirl', 'Static', 'Steel', 'Stephanie Powell', 'Steppenwolf', 'Storm',
  'Stormtrooper', 'Sunspot', 'Superboy', 'Superboy-Prime', 'Supergirl', 'Superman', 'Swamp Thing', 'Swarm', 'Sylar', 'Synch', 'T-1000',
  'T-800', 'T-850', 'T-X', 'Taskmaster', 'Tempest', 'Thanos', 'The Cape', 'The Comedian', 'Thing', 'Thor', 'Thor Girl', 'Thunderbird',
  'Thunderstrike', 'Thundra', 'Tiger Shark', 'Tigra', 'Tinkerer', 'Titan', 'Toad', 'Toxin', 'Tracy Strauss', 'Trickster', 'Trigon',
  'Triplicate Girl', 'Triton', 'Two-Face', 'Ultragirl', 'Ultron', 'Utgard-Loki', 'Vagabond', 'Valerie Hart', 'Valkyrie', 'Vanisher',
  'Vegeta', 'Venom', 'Venompool', 'Vertigo II', 'Vibe', 'Vindicator', 'Violator', 'Violet Parr', 'Vision', 'Vixen', 'Vulcan', 'Vulture',
  'Walrus', 'War Machine', 'Warbird', 'Warlock', 'Warp', 'Warpath', 'Wasp', 'Watcher', 'Weapon XI', 'White Canary', 'White Queen',
  'Wildfire', 'Winter Soldier', 'Wiz Kid', 'Wolfsbane', 'Wolverine', 'Wonder Girl', 'Wonder Man', 'Wonder Woman', 'Wondra',
  'Wyatt Wingfoot', 'X-23', 'X-Man', 'Yellow Claw', 'Yellowjacket', 'Ymir', 'Yoda', 'Zatanna', 'Zoom'];

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
