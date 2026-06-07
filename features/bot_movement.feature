Feature: Move the bot
  As a player
  I want to turn and move the bot
  So that I can navigate the map

  Scenario: Turn the bot to the left
    Given the bot has 10 fuel points
    And the bot is facing north
    When the bot executes "turn_left()"
    Then the bot is facing west
    And the bot has 9 fuel points

  Scenario: Move the bot forward
    Given the bot has 10 fuel points
    And the bot is facing north
    And the square north of the bot is empty
    When the bot executes "move()"
    Then the bot moves 1 square north
    And the bot has 9 fuel points

  Scenario: Lose after using the last fuel point
    Given the bot has 1 fuel point
    And the bot has not reached the goal
    When the bot executes "turn_left()"
    Then the bot has 0 fuel points
    And the player loses the game
