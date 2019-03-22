# What is this?
It is a module that expose data read from an MPU6050 sensor (acceleration + gyroscope) using a Raspberry Pi board.

PRs are welcome.

# Instructions

### Requirements:
 - Raspberry Pi board
 - MPU6050 module
 - Node.js >= 10 (LTS)

### Setting up the Raspberry Pi board:
This module requires a proper setup of a Raspberry Pi board. A detailed walkthrough on how to prepare the Raspberry Pi setup can be found [here](./PI-SETUP.md).

### To install locally: 
1. Clone the repository in a directory `[directory]`
2. `cd [directory]`
3. `npm install`
4. Enjoy.

### To uninstall:
1. Remove the repo directory

### To run tests:
The package includes a **full test coverage**.
Go inside the repo directory and run: 

`npm test`

Once executed you can find the coverage report in a neat html format:
1. `cd coverage`
2. open with a browser the file `index.html`

### Usage:


### Notes:
The code is fully commented.
All the functions and helpers are documented using JSHint conventions. That will trigger autocompletion and code hints in code editors like Visual Studio Code.