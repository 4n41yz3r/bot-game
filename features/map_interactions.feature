Feature: Interact with the map
  As a player
  I want map squares to affect the bot
  So that navigating the map is a programming challenge

  Scenario: Reach the goal
    Given the square in front of the bot is the goal
    When the bot executes "move()"
    Then the player wins the game

  Scenario: Move into a hazard
    Given the square in front of the bot is a hazard
    When the bot executes "move()"
    Then the bot is destroyed
    And the player loses the game

  Scenario: Leave the map
    Given the bot is at the edge of the map
    And the bot is facing away from the map
    When the bot executes "move()"
    Then the bot is destroyed
    And the player loses the game

  Scenario: Collect a power-up
    Given the bot has 8 fuel points
    And the square in front of the bot is a power-up
    When the bot executes "move()"
    Then the bot has 10 fuel points

  Scenario: Collect a power-up only once
    Given the bot has already collected a power-up
    And the bot has 8 fuel points
    When the bot moves onto the same power-up square again
    Then the bot has 7 fuel points

  Scenario: Exceed the initial fuel amount
    Given the bot has 10 fuel points
    And the square in front of the bot is a power-up
    When the bot executes "move()"
    Then the bot has 12 fuel points
