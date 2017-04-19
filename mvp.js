'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Zone = { void: 0, deck: 1, hand: 2, play: 3, 1: 'inDeck', 2: 'inHand', 3: 'inPlay' };

var game = void 0;

window.queueCommand = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  setTimeout(function (_) {
    var _game;

    return (_game = game).queueCommand.apply(_game, args);
  }, 100 * (window.slow ? 300 : 1));
};

var Entity = function () {
  function Entity() {
    var _this = this;

    var tags = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Entity);

    game = game || this;
    Object.assign(this, tags);
    this.id = game.entities.push(this) - 1;
    selectors(this, game.entities);
    var _arr = [1, 2, 3];

    var _loop = function _loop() {
      var z = _arr[_i];
      Object.defineProperty(_this, Zone[z], { get: function get() {
          return _this.zone === z;
        }, enumerable: true });
    };

    for (var _i = 0; _i < _arr.length; _i++) {
      _loop();
    }this['is' + this.constructor.name] = true;
  }

  _createClass(Entity, [{
    key: 'toString',
    value: function toString() {
      return (this.name || this.constructor.name + (this.card ? '(' + this.card.id + ')' : '')) + '#' + this.id;
    }
  }]);

  return Entity;
}();

var Minion = function (_Entity) {
  _inherits(Minion, _Entity);

  function Minion() {
    _classCallCheck(this, Minion);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Minion).call(this));

    _this2.tags = { cost: 0, atk: 0, health: 0, damage: 0 };
    return _this2;
  }

  _createClass(Minion, [{
    key: 'targets',
    get: function get() {
      var enemies = this.enemy.visible.characters;
      var taunt = this.enemy.visible.minions.filter(function (m) {
        return m.taunt;
      });
      return this.inPlay && (taunt.length ? taunt : enemies);
    }
  }, {
    key: 'green',
    get: function get() {
      return this.inPlay && this.atk && !this.exhausted || this.inHand && this.cost <= this.owner.mana && this.minions.length < 7;
    }
  }, {
    key: 'life',
    get: function get() {
      return this.health - this.damage;
    }
  }]);

  return Minion;
}(Entity);

var Spell = function (_Entity2) {
  _inherits(Spell, _Entity2);

  function Spell() {
    _classCallCheck(this, Spell);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Spell).call(this));

    _this3.tags = { cost: 0, cast: null };
    return _this3;
  }

  _createClass(Spell, [{
    key: 'green',
    get: function get() {
      return this.cost <= this.owner.mana;
    }
  }]);

  return Spell;
}(Entity);

var Power = function (_Entity3) {
  _inherits(Power, _Entity3);

  function Power() {
    _classCallCheck(this, Power);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(Power).call(this));

    _this4.tags = { cost: 2, activate: null, targets: null, zone: 4 }; // hack zone
    return _this4;
  }

  _createClass(Power, [{
    key: 'green',
    get: function get() {
      return !this.exhausted && this.cost <= this.owner.mana;
    }
  }]);

  return Power;
}(Entity);

var Hero = function (_Entity4) {
  _inherits(Hero, _Entity4);

  function Hero(card) {
    _classCallCheck(this, Hero);

    var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(Hero).call(this));

    _this5.tags = { damage: 0, health: 30, power: null };
    return _this5;
  }

  return Hero;
}(Entity);

var Player = function (_Entity5) {
  _inherits(Player, _Entity5);

  function Player(tags) {
    _classCallCheck(this, Player);

    var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(Player).call(this, tags));

    _this6.owner = _this6;
    _this6.crystals = 0;
    if (!tags.opponent) {
      _this6.hero = create(rnd(Cards.hero));
    } else {
      _this6.hero = create(rnd(Cards.hero.filter(function (h) {
        return h != tags.opponent.hero.card;
      })));
    }
    _this6.hero.power = create(Cards[_this6.hero.power]);
    _this6.hero.owner = _this6.hero.power.owner = _this6;
    _this6.hero.zone = Zone.play;
    if (_this6.first) game.owner = _this6;
    _this6.mulligan = true;
    var cards = Cards.collectable.filter(function (c) {
      return !(_this6 instanceof AI) || c.type == Minion;
    });
    for (var i = 0; i < 30; i++) {
      var m = create(rnd(cards));
      m.zone = Zone.deck;
      m.owner = _this6;
    }
    return _this6;
  }

  return Player;
}(Entity);

var AI = function (_Player) {
  _inherits(AI, _Player);

  function AI() {
    _classCallCheck(this, AI);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(AI).apply(this, arguments));
  }

  _createClass(AI, [{
    key: 'replace',
    value: function replace() {
      var replace = this.hand.filter(function (c) {
        return c.cost > 3;
      }).map(function (c) {
        return c.id;
      });
      game.queueCommand('Mulligan', this.id, replace);
    }
  }, {
    key: 'play',
    value: function play() {
      var _this8 = this;

      var coin = this.hand.find(function (c) {
        return c.name == 'coin';
      });
      var minions = this.hand.filter(function (c) {
        return c.isMinion && c.green;
      }).sort(function (a, b) {
        return b.cost - a.cost;
      });
      if (coin && !minions.length) minions = this.hand.filter(function (c) {
        return coin && c.isMinion && c.cost == _this8.mana + 1;
      });
      if (minions.length && !minions[0].green) game.queueCommand('Play', coin.id);
      if (minions.length) game.queueCommand('Play', minions[0].id, 0, rnd(this.minions.length + 1));
    }
  }, {
    key: 'attack',
    value: function attack() {
      var _this9 = this;

      var power = function power(a, b) {
        return b.atk - a.atk;
      };
      this.minions.filter(function (m) {
        return m.green;
      }).sort(power).map(function (m) {
        var taunt = _this9.enemy.minions.filter(function (m) {
          return m.taunt;
        }).sort(power);
        game.queueCommand('Attack', m.id, (taunt[0] || _this9.opponent.hero).id);
      });
      var taunt = this.enemy.minions.filter(function (m) {
        return m.taunt;
      }).sort(power);
      if (this.hero.power.green) game.queueCommand('Activate', this.hero.power.id, (taunt[0] || this.opponent.hero).id);
    }
  }, {
    key: 'turn',
    value: function turn() {
      this.play();
      this.play();
      this.attack();
      game.queueCommand('TurnEnd', this.id);
    }
  }]);

  return AI;
}(Player);

var Game = function (_Entity6) {
  _inherits(Game, _Entity6);

  function Game() {
    _classCallCheck(this, Game);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Game).call(this, { entities: [], debug: false }));
  }

  _createClass(Game, [{
    key: 'queueCommand',
    value: function queueCommand(cmd, src, tgt) {
      var _console;

      if (this.winner) return;

      for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        args[_key2 - 3] = arguments[_key2];
      }

      if (this.debug) (_console = console).info.apply(_console, [cmd, src, tgt || ''].concat(args));
      var actions = { Connect: Connect, Mulligan: Mulligan, Play: Play, Attack: Attack, Activate: Activate, TurnEnd: TurnEnd };
      new (Function.prototype.bind.apply(actions[cmd], [null].concat([this.all[src], tgt instanceof Array ? tgt : this.all[tgt] || tgt], args)))();
      new Process(this);
    }
    // unelegant, unoptimized and hacky serialization to avoid cyclical refs in JSON

  }, {
    key: 'event',
    value: function event() {
      var _this11 = this;

      var action = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var end = arguments[1];

      var player = this.entities[1];
      [this.minions, this.hand, this.enemy.minions, this.enemy.hand].map(function (z) {
        return z.map(function (e) {
          return e.of = z.length;
        });
      });
      var event = Object.assign({}, action);
      event.name = (end ? '/' : '') + action.constructor.name;
      event.source = action.source && action.source.id;
      event.target = action.target && action.target.id;
      event.args = (event.args || []).map(function (a) {
        return a && a.id || a;
      });
      event.end = end;
      event.options = {};
      if (player && game.owner == player) {
        event.options.turn = true;
        event.options.mulligan = player.mulligan;
      }
      event.entities = this.all.map(function (e) {
        var r = {};
        if (!e.owner) return { id: e.id };
        var keys = Object.getOwnPropertyNames(e.__proto__).filter(function (k) {
          return !(e[k] instanceof Function);
        });
        var id = function id(v) {
          return v instanceof Array ? v.map(id) : v instanceof Entity ? v.id : v;
        };
        keys.concat(Object.keys(e)).map(function (k) {
          return r[k] = id(e[k]);
        });
        r.green = r.green && e.owner == game.owner;
        r.ally = e.owner == player;
        r.str = '' + e;
        var options = !!r.green && (!r.targets || r.targets.length && r.targets);
        if (options) event.options[r.id] = options;
        return r;
      });
      window.onEvent(event);
      setTimeout(function (_) {
        if (player && game.debug && !player.hand.find(function (c) {
          return c.card == Cards.Z_999;
        })) {
          new Give(_this11, player, create(Cards.Z_999));
          game.event();
        }
      }, 1000);
    }
  }]);

  return Game;
}(Entity);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Action = function () {
  function Action(source, target) {
    _classCallCheck(this, Action);

    this.source = source;
    this.target = target;

    for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      args[_key3 - 2] = arguments[_key3];
    }

    this.args = args;
    game.event(this);
    this.resolve.apply(this, [source, target].concat(args));
    game.event(this, true);
  }

  _createClass(Action, [{
    key: 'repeat',
    value: function repeat(count) {
      var ret = [this];
      for (var i = 1; i < count; i++) {
        ret.push(new (Function.prototype.bind.apply(this.constructor, [null].concat([this.source, this.target], _toConsumableArray(this.args))))());
      }return ret;
    }
  }]);

  return Action;
}();

var Connect = function (_Action) {
  _inherits(Connect, _Action);

  function Connect() {
    _classCallCheck(this, Connect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Connect).apply(this, arguments));
  }

  _createClass(Connect, [{
    key: 'resolve',
    value: function resolve() {
      var first = rnd(2);
      var player = new Player({ first: first, class: 1 + rnd(2) });
      var ai = player.opponent = new AI({ first: !first, opponent: player });
      new Draw(game, player).repeat(4 - first);
      new Draw(game, ai).repeat(3 + first);
    }
  }]);

  return Connect;
}(Action);

var Draw = function (_Action2) {
  _inherits(Draw, _Action2);

  function Draw() {
    _classCallCheck(this, Draw);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Draw).apply(this, arguments));
  }

  _createClass(Draw, [{
    key: 'resolve',
    value: function resolve(_, player) {
      if (this.card = player.deck[player.mulligan * 5]) {
        this.card.position = player.hand.length;
        this.card.zone = Zone.hand;
        this.card.mulligan = player.mulligan * (4 - player.first);
        if (player.hand.length > 10) {
          game.event({});
          new Discard(this, this.card);
        }
      }
    }
  }]);

  return Draw;
}(Action);

var Mulligan = function (_Action3) {
  _inherits(Mulligan, _Action3);

  function Mulligan() {
    _classCallCheck(this, Mulligan);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Mulligan).apply(this, arguments));
  }

  _createClass(Mulligan, [{
    key: 'resolve',
    value: function resolve(player, replaced) {
      player.mulligan = false;
      replaced.map(function (id) {
        return new Shuffle(player, player.all[id]);
      }).map(function (s) {
        var c = new Draw(game, player).card;
        c.position = s.card.position;
        c.mulligan = 4 - player.first;
      });
      game.event({});
      player.hand.map(function (c) {
        return c.mulligan = 0;
      });
      if (!player.first) new Give(game, player, create(Cards.Z_100));
      game.event({});
      if (!(player instanceof AI)) {
        setTimeout(function (_) {
          player.opponent.replace();
          new Turn(player.first ? player : player.opponent);
          game.event({});
        }, 1000 * (rnd(4) + 2));
      }
    }
  }]);

  return Mulligan;
}(Action);

var Turn = function (_Action4) {
  _inherits(Turn, _Action4);

  function Turn() {
    _classCallCheck(this, Turn);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Turn).apply(this, arguments));
  }

  _createClass(Turn, [{
    key: 'resolve',
    value: function resolve(player) {
      game.owner = player;
      player.crystals = Math.min(10, player.crystals + 1);
      player.mana = player.crystals;
      player.all.map(function (m) {
        return m.exhausted = false;
      });
      new Draw(game, player);
      if (player instanceof AI) setTimeout(function (_) {
        return player.turn();
      }, 500 * rnd(player.hand.length));
    }
  }]);

  return Turn;
}(Action);

var Shuffle = function (_Action5) {
  _inherits(Shuffle, _Action5);

  function Shuffle() {
    _classCallCheck(this, Shuffle);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Shuffle).apply(this, arguments));
  }

  _createClass(Shuffle, [{
    key: 'resolve',
    value: function resolve(source, card) {
      card.zone = Zone.deck;
      this.card = card;
    }
  }]);

  return Shuffle;
}(Action);

var Give = function (_Action6) {
  _inherits(Give, _Action6);

  function Give() {
    _classCallCheck(this, Give);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Give).apply(this, arguments));
  }

  _createClass(Give, [{
    key: 'resolve',
    value: function resolve(_, player, card) {
      card.position = player.hand.length;
      card.zone = Zone.hand;
      card.owner = player;
      // game.event(this);
    }
  }]);

  return Give;
}(Action);

var Summon = function (_Action7) {
  _inherits(Summon, _Action7);

  function Summon() {
    _classCallCheck(this, Summon);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Summon).apply(this, arguments));
  }

  _createClass(Summon, [{
    key: 'resolve',
    value: function resolve(_, player, minion) {
      minion.position = player.minions.length;
      minion.owner = player;
      minion.zone = Zone.play;
      minion.exhausted = true;
      this.minion = minion.id;
      // game.event(this);
    }
  }]);

  return Summon;
}(Action);

var Play = function (_Action8) {
  _inherits(Play, _Action8);

  function Play() {
    _classCallCheck(this, Play);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Play).apply(this, arguments));
  }

  _createClass(Play, [{
    key: 'resolve',
    value: function resolve(card, target, position) {
      card.owner.mana -= card.cost;
      card.hand.map(function (c) {
        return c.position -= c.position > card.position;
      });
      if (card.isSpell) {
        card.zone = Zone.void;
        card.cast(target);
      } else {
        position = Math.min(position, card.minions.length);
        card.minions.map(function (m) {
          return m.position += m.position >= position;
        });
        card.position = position;
        card.exhausted = !card.charge;
        card.zone = Zone.play;
      }
    }
  }]);

  return Play;
}(Action);

var Attack = function (_Action9) {
  _inherits(Attack, _Action9);

  function Attack() {
    _classCallCheck(this, Attack);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Attack).apply(this, arguments));
  }

  _createClass(Attack, [{
    key: 'resolve',
    value: function resolve(attacker, defender) {
      attacker.stealth = false;
      attacker.exhausted = true;
      new Deal(attacker, defender, attacker.atk);
      if (defender.atk) new Deal(defender, attacker, defender.atk);
    }
  }]);

  return Attack;
}(Action);

var Activate = function (_Action10) {
  _inherits(Activate, _Action10);

  function Activate() {
    _classCallCheck(this, Activate);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Activate).apply(this, arguments));
  }

  _createClass(Activate, [{
    key: 'resolve',
    value: function resolve(power, target) {
      power.owner.mana -= power.cost;
      power.activate(target);
      power.exhausted = true;
    }
  }]);

  return Activate;
}(Action);

var Deal = function (_Action11) {
  _inherits(Deal, _Action11);

  function Deal() {
    _classCallCheck(this, Deal);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Deal).apply(this, arguments));
  }

  _createClass(Deal, [{
    key: 'resolve',
    value: function resolve(_, victim, damage) {
      victim.damage += damage;
    }
  }]);

  return Deal;
}(Action);

var Heal = function (_Action12) {
  _inherits(Heal, _Action12);

  function Heal() {
    _classCallCheck(this, Heal);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Heal).apply(this, arguments));
  }

  _createClass(Heal, [{
    key: 'resolve',
    value: function resolve(_, target, life) {
      target.damage = Math.max(target.damage - life, 0);
    }
  }]);

  return Heal;
}(Action);

var Destroy = function (_Action13) {
  _inherits(Destroy, _Action13);

  function Destroy() {
    _classCallCheck(this, Destroy);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Destroy).apply(this, arguments));
  }

  _createClass(Destroy, [{
    key: 'resolve',
    value: function resolve(_, victim) {
      victim.destroy = true;
    }
  }]);

  return Destroy;
}(Action);

var Process = function (_Action14) {
  _inherits(Process, _Action14);

  function Process() {
    _classCallCheck(this, Process);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Process).apply(this, arguments));
  }

  _createClass(Process, [{
    key: 'resolve',
    value: function resolve() {
      var _this26 = this;

      var victims = game.all.characters.filter(function (e) {
        return e.damage >= e.health || e.destroy;
      }).map(function (e) {
        return new Death(_this26, e);
      });
      if (victims.length) game.event({}); // hack
    }
  }]);

  return Process;
}(Action);

var Death = function (_Action15) {
  _inherits(Death, _Action15);

  function Death() {
    _classCallCheck(this, Death);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Death).apply(this, arguments));
  }

  _createClass(Death, [{
    key: 'resolve',
    value: function resolve(_, victim) {
      victim.minions.map(function (m) {
        return m.position -= m.position > victim.position;
      });
      victim.zone = Zone.void;
      if (victim.isHero) new GameOver(victim);
    }
  }]);

  return Death;
}(Action);

var Discard = function (_Action16) {
  _inherits(Discard, _Action16);

  function Discard() {
    _classCallCheck(this, Discard);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Discard).apply(this, arguments));
  }

  _createClass(Discard, [{
    key: 'resolve',
    value: function resolve(_, card) {
      card.zone = Zone.void;
    }
  }]);

  return Discard;
}(Action);

var TurnEnd = function (_Action17) {
  _inherits(TurnEnd, _Action17);

  function TurnEnd() {
    _classCallCheck(this, TurnEnd);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TurnEnd).apply(this, arguments));
  }

  _createClass(TurnEnd, [{
    key: 'resolve',
    value: function resolve(player) {
      new Turn(player.opponent);
    }
  }]);

  return TurnEnd;
}(Action);

var GameOver = function (_Action18) {
  _inherits(GameOver, _Action18);

  function GameOver() {
    _classCallCheck(this, GameOver);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GameOver).apply(this, arguments));
  }

  _createClass(GameOver, [{
    key: 'resolve',
    value: function resolve(victim) {
      game.winner = victim.owner.opponent;
    }
  }]);

  return GameOver;
}(Action);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// (all|enemy|[my.])(minions|characters|hand|deck)[.random]


function selectors(pov, array) {
  var owner = { all: function all(e) {
      return true;
    }, enemy: function enemy(e) {
      return e.owner !== pov.owner;
    } };
  var zones = {
    deck: function deck(e) {
      return e.inDeck;
    },
    hand: function hand(e) {
      return e.inHand;
    },
    minions: function minions(e) {
      return e.inPlay && e.isMinion;
    },
    visible: function visible(e) {
      return !e.stealth || e.owner == pov.owner;
    },
    characters: function characters(e) {
      return e.inPlay && e.isMinion || e.isHero;
    }
  };
  pop(owner, pov, array);
  pop(zones, pov, array, function (e) {
    return e.owner == pov.owner;
  });

  function pop(filters, obj) {
    var arr = arguments.length <= 2 || arguments[2] === undefined ? obj : arguments[2];
    var base = arguments.length <= 3 || arguments[3] === undefined ? owner.all : arguments[3];

    Object.keys(filters).map(function (f) {
      return Object.defineProperty(obj, f, { get: function get(_) {
          return pop(zones, arr.filter(base).filter(filters[f]));
        } });
    });
    if (obj instanceof Array) Object.defineProperty(obj, 'random', { get: function get() {
        return rnd(arr);
      } });
    return obj;
  }
}

function rnd(n) {
  return n instanceof Array ? n[rnd(n.length)] : Math.trunc(Math.random() * n);
}

window.game = new Game();

window.Cards = {

  // coin
  Z_100: {
    text: 'gain (1) mana this turn only',
    cast: function cast() {
      this.owner.mana = Math.min(10, this.owner.mana + 1);
    }
  },

  // paladin
  Z_101: {
    power: 'Z_101p'
  },
  // guys
  Z_101p: {
    get green() {
      return !this.exhausted && this.cost <= this.owner.mana && this.minions.length < 7;
    },
    activate: function activate() {
      new Summon(this, this.owner, create(Cards.Z_101g));
    }
  },
  // guy
  Z_101g: { atk: 1, health: 1 },

  // hitman
  Z_102: {
    power: 'Z_102p'
  },
  // pistol
  Z_102p: {
    get targets() {
      return this.all.visible.characters;
    },
    activate: function activate(target) {
      new Deal(this, target, 1);
    }
  },

  // shroom
  Z_110: { cost: 0, atk: 0, health: 3, taunt: true },

  // wisp
  Z_111: { cost: 0, atk: 1, health: 1 },

  // pleb
  Z_301: {
    cost: 3,
    text: 'destroy a vanilla minion',
    get targets() {
      return this.all.minions.filter(function (m) {
        return m.vanilla;
      });
    },
    cast: function cast(target) {
      new Destroy(this, target);
    }
  },

  // trump
  Z_302: {
    cost: 2,
    text: 'destroy a random non-vanilla minion',
    get green() {
      return this.owner.mana >= 2 && this.all.minions.filter(function (m) {
        return !m.vanilla;
      }).length;
    },
    cast: function cast() {
      new Destroy(this, rnd(this.all.minions.filter(function (m) {
        return !m.vanilla;
      })));
    }
  },

  // firesmash
  Z_303: {
    cost: 5,
    text: 'deal 3 damage to enemy minions',
    cast: function cast() {
      var _this31 = this;

      this.enemy.minions.map(function (m) {
        return new Deal(_this31, m, 3);
      });
    }
  },

  // debug
  Z_999: {
    text: 'deal a damage, heal your hero, &nbsp;gain a mana,&nbsp; draw a card',
    get targets() {
      return this.all.characters;
    },
    cast: function cast(target) {
      new Deal(this, target, 1);
      new Heal(this, this.owner.hero, 1);
      this.owner.mana = Math.min(this.owner.mana + 1, 10);
      this.owner.crystals = Math.min(this.owner.crystals + 1, 10);
      new Draw(this, this.owner);
      game.event();
    }
  }

};

window.inflate = inflate;
// populate Cards DB with vanilla minions, redundant and derivable data
function inflate() {
  var art = 200;
  for (var attack = 1; attack < 10; attack++) {
    for (var health = attack % 2 + 1; health < 10; health += 2) {
      var cost = (attack + health - 1) / 2;
      var taunt = !((1 + art) % 5);
      var charge = !((5 + art) % 6);
      var stealth = !((3 + art) % 7) && !taunt && !charge;
      var atk = attack - (atk > 1 && (stealth || taunt || charge));
      var id = 'V_' + cost + atk + health;
      Cards[id] = { atk: atk, health: health, cost: cost, taunt: taunt, stealth: stealth, charge: charge, art: art++ };
    }
  }
  var src = new XMLHttpRequest();
  src.open('GET', './mvp.js', false);
  src.send(null);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = src.responseText.match(/\/\/[\w\s]+:/g)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var p = _step.value;

      var m = p.match(/\/\/ ([\w\s]+)\s+(\w+):/);
      if (Cards[m[2]]) Cards[m[2]].name = m[1].trim();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ;

  var duckType = { power: Hero, activate: Power, cast: Spell, health: Minion };

  var _loop2 = function _loop2(_id) {
    var c = Cards[_id];
    c.type = duckType[Object.keys(duckType).find(function (k) {
      return k in c;
    })];
    c.vanilla = !c.stealth && !c.taunt && !c.charge;
    c.id = _id;
  };

  for (var _id in Cards) {
    _loop2(_id);
  }

  var keys = Object.keys(Cards);
  var filters = { all: 'constructor', hero: 'power', collectable: 'cost', spell: 'cast' };
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    var _loop3 = function _loop3() {
      var f = _step2.value;

      filters[f] = keys.filter(function (k) {
        return filters[f] in Cards[k];
      }).map(function (k) {
        return Cards[k];
      });
      Object.defineProperty(Cards, f, { value: filters[f] });
    };

    for (var _iterator2 = Object.keys(filters)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      _loop3();
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  filters.collectable.push(Cards.Z_111, Cards.Z_111);
  for (var i = 0; i < 10; i++) {
    filters.collectable.push(Cards.Z_301, Cards.Z_302, Cards.Z_303);
  }
}

function create(card) {
  var e = new card.type(card);
  e.art = card.art || card.id.replace('Z_', '');
  e.card = card;
  e.data = {};
  var tags = Object.assign({}, e.tags);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = Object.keys(card)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _k = _step3.value;

      var p = Object.getOwnPropertyDescriptor(card, _k);
      if (p.get) p.get = p.get.bind(e);
      Object.defineProperty(e.data, _k, p);
      if (_k != 'id' && !(_k in tags)) tags[_k] = undefined;
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var _loop4 = function _loop4(k) {
    var get = function get() {
      return k in e.data ? e.data[k] : tags[k];
    };
    var set = function set(v) {
      return e.data[k] = v;
    };
    Object.defineProperty(e, k, { get: get, set: set, enumerable: true });
  };

  for (var k in tags) {
    _loop4(k);
  }
  return e;
}