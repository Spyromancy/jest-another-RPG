const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');

function Game() {
    this.roundNumber = 0;
    this.isPlayerTurn = false;
    this.enemies = [];
    this.currentEnemy;
    this.player;

    Game.prototype.initializeGame = function() {
        this.enemies.push(new Enemy('goblin', 'sword'));
        this.enemies.push(new Enemy('orc', 'baseball bat'));
        this.enemies.push(new Enemy('skeleton', 'axe'));

        this.currentEnemy = this.enemies[0];

        inquirer
            .prompt({
                type:'text',
                name: 'name',
                message: 'What is your name?'
            })
            .then(({ name }) => {
                this.player = new Player(name);
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
                        if (!this.player.getInventory()) {
                            console.log('You search your bag for a potion only to find you have run out!');
                            return;
                        }
                        inquirer
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
                            }
                            )
                    }
                    else {
                        const dmg = this.player.getAttackValue();
                        this.currentEnemy.reduceHealth(dmg);

                        console.log(`You attacked the ${this.currentEnemy.name}`);
                        console.log(this.currentEnemy.getHealth());
                    }
                })
        }
        else{
            const dmg = this.currentEnemy.getAttackValue();
            this.player.reduceHealth(dmg);
            
            console.log(`The ${this.currentEnemy.name} stuck you with their ${this.currentEnemy.weapon}!`);
            console.log(this.player.getHealth());
        }
    }

}

module.exports = Game;