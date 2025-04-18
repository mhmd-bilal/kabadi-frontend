import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interfaces for our data structure
export interface Player {
  id: string;
  number: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  players: Player[];
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  winnerTeamId: string | null;
  bestRaider?: string;
  bestDefender?: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  location: string;
  groundName: string;
  startTime: string; // ISO string format
  status: 'scheduled' | 'in-progress' | 'completed';
  result: MatchResult | null;
}

// Local Storage functions
const storageHelper = {
  // Get all teams from storage
  getTeams: async (): Promise<Team[]> => {
    try {
      const teamsJson = await AsyncStorage.getItem('teams');
      return teamsJson ? JSON.parse(teamsJson) : [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  // Save teams to storage
  saveTeams: async (teams: Team[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('teams', JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  },

  // Add or update a team
  saveTeam: async (team: Team): Promise<void> => {
    const teams = await storageHelper.getTeams();
    const existingIndex = teams.findIndex(t => t.id === team.id);
    
    if (existingIndex >= 0) {
      teams[existingIndex] = team;
    } else {
      teams.push(team);
    }
    
    await storageHelper.saveTeams(teams);
  },

  // Delete a team
  deleteTeam: async (teamId: string): Promise<void> => {
    const teams = await storageHelper.getTeams();
    const filteredTeams = teams.filter(team => team.id !== teamId);
    await storageHelper.saveTeams(filteredTeams);
  },

  // Get all matches from storage
  getMatches: async (): Promise<Match[]> => {
    try {
      const matchesJson = await AsyncStorage.getItem('matches');
      return matchesJson ? JSON.parse(matchesJson) : [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  // Save matches to storage
  saveMatches: async (matches: Match[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('matches', JSON.stringify(matches));
    } catch (error) {
      console.error('Error saving matches:', error);
    }
  },

  // Add or update a match
  saveMatch: async (match: Match): Promise<void> => {
    const matches = await storageHelper.getMatches();
    const existingIndex = matches.findIndex(m => m.id === match.id);
    
    if (existingIndex >= 0) {
      matches[existingIndex] = match;
    } else {
      matches.push(match);
    }
    
    await storageHelper.saveMatches(matches);
  },

  // Delete a match
  deleteMatch: async (matchId: string): Promise<void> => {
    const matches = await storageHelper.getMatches();
    const filteredMatches = matches.filter(match => match.id !== matchId);
    await storageHelper.saveMatches(filteredMatches);
  }
};

export default storageHelper; 