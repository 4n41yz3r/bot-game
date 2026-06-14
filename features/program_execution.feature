Feature: Run a bot program
  As a player
  I want to run a complete JavaScript program
  So that I can guide the bot to the goal

  Scenario: Run one complete program for an attempt
    Given the player has written a valid JavaScript program
    When the player runs the program
    Then the program is executed as one attempt

  Scenario: Define and use a helper function
    Given the player has written:
      """
      function turn_right() {
        turn_left();
        turn_left();
        turn_left();
      }

      turn_right();
      """
    When the player runs the program
    Then the bot turns 90 degrees to the right
    And the bot uses 3 fuel points

  Scenario: Stop an infinite command loop after the game ends
    Given the square in front of the bot is a hazard
    And the player has written:
      """
      while (true) {
        move();
      }
      """
    When the player runs the program
    Then the bot is destroyed
    And the player loses the game
    And the program is executed as one attempt
