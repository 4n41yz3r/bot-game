Feature: Start a game
  As a player
  I want a newly generated map and a fueled bot
  So that I can solve a new programming challenge

  Scenario: Generate a new game
    When a new game is started
    Then the map is an 8 by 8 grid
    And the map contains 1 bot
    And the map contains 1 goal
    And the map contains 10 hazards
    And the map contains 5 power-ups
    And the bot has 10 fuel points

