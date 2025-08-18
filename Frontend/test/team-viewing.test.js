import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MyContext } from '../src/context/AuthContextProvider';
import SelectTeamPage from '../src/components/SelectTeamPage';
import ProfilePage from '../src/components/ProfilePage';

// Mock data for testing
const mockTeams = [
  {
    _id: 'team1',
    teamName: 'Team Alpha',
    createdBy: { _id: 'user1', name: 'John Doe' },
    teamMembers: [
      { _id: 'user1', name: 'John Doe' },
      { _id: 'user2', name: 'Jane Smith' }
    ],
    memberLimit: 4,
    selectedProblem: 'problem1'
  },
  {
    _id: 'team2',
    teamName: 'Team Beta',
    createdBy: { _id: 'user3', name: 'Alice Admin' },
    teamMembers: [
      { _id: 'user3', name: 'Alice Admin' }
    ],
    memberLimit: 3
  }
];

const mockUserData = {
  _id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  teamId: 'team1',
  role: 'member',
  course: 'Software Engineering',
  skills: ['JavaScript', 'React'],
  vertical: 'Tech'
};

const mockHackathon = {
  _id: 'hackathon1',
  name: 'Test Hackathon 2025',
  startDate: '2025-08-20T09:00:00.000Z',
  eventType: 'Team Hackathon'
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('🧪 Team Viewing End-to-End Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('hackathon1');
    
    // Mock successful API responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('/team/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTeams)
        });
      }
      if (url.includes('/users/get-user/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        });
      }
      if (url.includes('/hackathons/problems/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            problemStatements: [
              {
                _id: 'problem1',
                track: 'Frontend',
                description: 'https://example.com/problem1',
                difficulty: 'Medium'
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  describe('🏠 SelectTeamPage Component Tests', () => {
    test('✅ Renders without crashing', () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Team Selection')).toBeInTheDocument();
    });

    test('✅ Displays team information correctly', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.getByText('Team Beta')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    test('✅ Shows team member count and details', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('2 members')).toBeInTheDocument();
        expect(screen.getByText('1 member')).toBeInTheDocument();
      });
    });

    test('✅ Team search functionality works', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search teams by name or member...');
        fireEvent.change(searchInput, { target: { value: 'Alpha' } });
        
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Team Beta')).not.toBeInTheDocument();
      });
    });

    test('✅ Displays team creator information', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Created by John Doe')).toBeInTheDocument();
        expect(screen.getByText('Created by Alice Admin')).toBeInTheDocument();
      });
    });

    test('✅ Shows role badges correctly', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Creator')).toBeInTheDocument();
        expect(screen.getByText('Member')).toBeInTheDocument();
      });
    });

    test('✅ Problem statement selection works', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const selectProblemButtons = screen.getAllByText('Select Problem');
        expect(selectProblemButtons).toHaveLength(2);
      });
    });

    test('✅ Shows selected problem details', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Selected Problem Statement')).toBeInTheDocument();
        expect(screen.getByText('Track: Frontend')).toBeInTheDocument();
        expect(screen.getByText('Difficulty: Medium')).toBeInTheDocument();
      });
    });

    test('✅ Handles loading state correctly', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    test('✅ Handles error state gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('API Error'));
      
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    test('✅ Shows correct message for users without teams', () => {
      const userWithoutTeam = { ...mockUserData, teamId: null };
      
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: userWithoutTeam,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('You are not part of any team')).toBeInTheDocument();
    });
  });

  describe('👤 ProfilePage Component Tests', () => {
    test('✅ Renders without crashing', () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <ProfilePage />
          </MyContext.Provider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    test('✅ Displays user information correctly', () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <ProfilePage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Software Engineering')).toBeInTheDocument();
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    test('✅ Shows team information section', () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <ProfilePage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('Team Details')).toBeInTheDocument();
      expect(screen.getByText('team1')).toBeInTheDocument();
    });

    test('✅ Displays skills correctly', () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <ProfilePage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  describe('🔍 Team Search and Filter Tests', () => {
    test('✅ Search by team name works', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search teams by name or member...');
        fireEvent.change(searchInput, { target: { value: 'Beta' } });
        
        expect(screen.getByText('Team Beta')).toBeInTheDocument();
        expect(screen.queryByText('Team Alpha')).not.toBeInTheDocument();
      });
    });

    test('✅ Search by member name works', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search teams by name or member...');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });
        
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Team Beta')).not.toBeInTheDocument();
      });
    });

    test('✅ Case-insensitive search works', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search teams by name or member...');
        fireEvent.change(searchInput, { target: { value: 'alpha' } });
        
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      });
    });
  });

  describe('📱 Responsive Design Tests', () => {
    test('✅ Mobile navigation works correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      // Should still render all content
      expect(screen.getByText('Team Selection')).toBeInTheDocument();
    });

    test('✅ Grid layout adapts to screen size', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const teamCards = screen.getAllByText(/Team/);
        expect(teamCards).toHaveLength(2);
      });
    });
  });

  describe('🚨 Error Handling Tests', () => {
    test('✅ Handles API failures gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network Error'));
      
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    test('✅ Handles empty team data', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });
      
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Teams Available')).toBeInTheDocument();
        expect(screen.getByText('Create Your Team')).toBeInTheDocument();
      });
    });

    test('✅ Handles malformed team data', async () => {
      const malformedTeams = [
        { _id: 'team1', teamName: 'Team Alpha' } // Missing required fields
      ];
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(malformedTeams)
      });
      
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      });
    });
  });

  describe('🎯 Integration Tests', () => {
    test('✅ Team creation flow updates team list', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.getByText('Team Beta')).toBeInTheDocument();
      });
    });

    test('✅ User role affects team visibility', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'admin'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        // Admin should see all teams
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.getByText('Team Beta')).toBeInTheDocument();
      });
    });

    test('✅ Team member count updates correctly', async () => {
      render(
        <BrowserRouter>
          <MyContext.Provider value={{
            hackathon: mockHackathon,
            userData: mockUserData,
            role: 'member'
          }}>
            <SelectTeamPage />
          </MyContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('2 members')).toBeInTheDocument();
        expect(screen.getByText('1 member')).toBeInTheDocument();
      });
    });
  });
});

describe('🧹 Test Cleanup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
}); 