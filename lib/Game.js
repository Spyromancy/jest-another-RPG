const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');

function Game() {
    this.roundNumber = 0;
    this.isPlayerTurn = false;
    this.enemies = [];
    this.currentEnemy;
    this.player;
    this.playerInitiative
    this.enemyInitiative

    Game.prototype.initializeGame = function() {
        this.enemies.push(new Enemy('goblin', 'sword'));
        this.enemies.push(new Enemy('orc', 'baseball bat'));
        this.enemies.push(new Enemy('skeleton', 'axe'));

        this.currentEnemy = this.enemies[0];
        this.enemyInitiative = this.currentEnemy.agility

        inquirer
            .prompt({
                type:'text',
                name: 'name',
                message: 'What is your name?'
            })
            .then(({ name }) => {
                this.player = new Player(name);
                this.playerInitiative = this.player.agility;
                this.startNewBattle();
            });
    };

    Game.prototype.startNewBattle = function() {
        if(this.player.agility > this.currentEnemy.agility){
            this.isPlayerTurn = true;
        }
        else{
            this.isPlayerTurn = false;
        }
        console.log('Your stats are as follows:');
        console.table(this.player.getStats());
        console.log(this.currentEnemy.getDescription());
        this.battle()
    };

    Game.prototype.battle = function() {
        if(this.isPlayerTurn){
            inquirer
                .prompt({
                    type:'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: ['Attack!', 'Use Potion']
                })
                .then(({ action }) => {
                    if (action === 'Use Potion') {
                        if (!this.player.getInventory()) {  // No potion to use
                            console.log('You search your bag for a potion only to find you have run out!');
                            this.checkEndOfBattle();
                        }
                        else {
                            inquirer // Has Potion to use
                            .prompt({
                                type:'list',
                                name: 'action',
                                message: 'Which potion will you use?',
                                choices: this.player.getInventory().map((item,index) => `${index + 1}: ${item.name}`)
                            })
                            .then(({ action }) => {
                                const potionDetails = action.split(': ');

                                this.player.usePotion(potionDetails[0]-1)
                                console.log(`You have used a ${potionDetails[1]} potion.`)
                                this.checkEndOfBattle();
                            }
                            )
                        }
                    }
                    else { // Player Attack
                        const dmg = this.player.getAttackValue();
                        this.currentEnemy.reduceHealth(dmg);

                        console.log(`You attacked the ${this.currentEnemy.name}`);
                        console.log(this.currentEnemy.getHealth());
                        this.checkEndOfBattle();
                    }
                })
        }
        else{ // Enemy Attack
            const dmg = this.currentEnemy.getAttackValue();
            this.player.reduceHealth(dmg);
            
            console.log(`The ${this.currentEnemy.name} stuck you with their ${this.currentEnemy.weapon}!`);
            console.log(this.player.getHealth());

            this.checkEndOfBattle();
        }
    }

    Game.prototype.checkEndOfBattle = function() {
        if (this.player.isAlive() && this.currentEnemy.isAlive()){ // rework agility to work like SR initiative
            /*
            remove 10 from initiative
            - both initiative <= 0:
                - reset Init
                - check who is faster, set playerTurn accordingly
            - only player init is > 0:
                - playerTurn = true
                - battle()
            - only enemy init is > 0:
                - playerTurn = false
                - battle()
            */
            if(this.isPlayerTurn){
                this.playerInitiative -= 10;
            }
            else {
                this.enemyInitiative -= 10;
            }
            
            if (this.playerInitiative <= 0 && this.enemyInitiative <= 0){
                this.enemyInitiative = this.currentEnemy.agility;
                this.playerInitiative = this.player.agility;                
            }

            if(this.playerInitiative > this.enemyInitiative){
                this.isPlayerTurn = true;
            }
            else{
                this.isPlayerTurn = false;
            }
            this.battle();

        }
        else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
            console.log(`You defeated the ${this.currentEnemy.name}!`);

            this.player.addPotion(this.currentEnemy.potion);
            console.log(`After looting the ${this.currentEnemy.name}'s corpse you find a ${this.currentEnemy.potion.name} potion!`);

            this.roundNumber++;
            
            if(this.roundNumber < this.enemies.length) {
                this.currentEnemy = this.enemies[this.roundNumber];
                this.enemyInitiative = this.currentEnemy.agility;
                this.playerInitiative = this.player.agility;
                this.startNewBattle();
            }
            else {
                console.log('You Win!');
            }
        }
        else {
            console.log(`The ${this.currentEnemy.name} strikes you down. You are dead.`);
        }
    }

}

module.exports = Game;