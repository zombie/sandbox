'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Board = function (_React$Component) {
  _inherits(Board, _React$Component);

  function Board() {
    _classCallCheck(this, Board);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Board).call(this));

    _this.state = { entities: [{}], queue: [], me: {}, art: [], options: {} };
    window.onEvent = _this.onEvent.bind(_this);
    var mouse = function mouse(e) {
      var target = e.target;
      var type = e.type;
      var buttons = e.buttons;

      while (target.parentNode && !target.id) {
        target = target.parentNode;
      }
      var _this$coord = _this.coord(e);

      var x = _this$coord.x;
      var y = _this$coord.y;
      var p = _this$coord.p;

      _this[type](target && _this.state.entities[target.id], x, y, p, buttons);
    };
    var _arr = ['mousedown', 'mousemove', 'mouseup'];
    for (var _i = 0; _i < _arr.length; _i++) {
      var type = _arr[_i];
      window.addEventListener(type, throttle(mouse));
    }return _this;
  }

  _createClass(Board, [{
    key: 'mousedown',
    value: function mousedown(target, x, y) {
      var options = this.state.options;

      var green = target && options[target.id];
      if (target && (green || this.state.me.mulligan && target.inHand)) {
        this.setState({ source: target, mouse: { x: x, y: y }, detail: 0 });
      }
    }
  }, {
    key: 'mousemove',
    value: function mousemove(target, x, y, pos, buttons) {
      var _this2 = this;

      var _state = this.state;
      var me = _state.me;
      var source = _state.source;
      var detail = _state.detail;
      var mouse = _state.mouse;

      if (!me.mulligan && !buttons && (target && target.inHand || detail)) {
        this.setState({ detail: target && target.inHand && target.id });
      }
      if (source && buttons) {
        var vx = mouse && x - mouse.x;
        var vy = mouse && y - mouse.y;
        this.setState({ mouse: { x: x, y: y, pos: pos, vx: vx, vy: vy } });
        requestAnimationFrame(function (_) {
          return requestAnimationFrame(function (_) {
            var mouse = Object.assign({}, _this2.state.mouse || {}, { vx: 0, vy: 0 });
            if (mouse.x != x || mouse.y != y) _this2.setState({ mouse: mouse });
          });
        });
      }
    }
  }, {
    key: 'mouseup',
    value: function mouseup(target, x, y, pos) {
      var _state2 = this.state;
      var me = _state2.me;
      var source = _state2.source;
      var entities = _state2.entities;
      var minions = _state2.minions;
      var tmp = _state2.tmp;
      var inq = _state2.inq;
      var queue = _state2.queue;
      var mouse = _state2.mouse;

      if (me.mulligan && source == target && target) {
        target.replace = !target.replace;
      }
      if (source && source.inPlay && target && source.targets && source.targets.includes(target.id)) {
        this.queueCommand('Attack', source.id, target.id);
      }
      if (source && source.isPower && (source.targets && target ? source.targets.includes(target.id) : source == target)) {
        this.queueCommand('Activate', source.id, target.id);
      }
      var valid = source && (source.isMinion || !source.targets || target && source.targets.includes(target.id));
      if (!me.mulligan && source && source.inHand && y < 32 && valid) {
        if (source.isSpell) {
          this.queueCommand('Play', source.id, target && target.id);
          source.tmpSpell = true;
          source.discard = true;
          if (!source.targets) {
            source.x = -45;
            source.y = 0;
          }
        } else {
          this.queueCommand('Play', source.id, 0, pos);
          source.position = pos;
          source.of = (minions || 0) + 1;
          source.tmp = true;
          source.zone = 3;
          tmp = source;
        }
      }
      this.setState({ source: null, mouse: null, tmp: tmp });
    }
  }, {
    key: 'queueCommand',
    value: function queueCommand() {
      var _window;

      (_window = window).queueCommand.apply(_window, arguments);
      this.setState({ options: {} });
    }
  }, {
    key: 'onEvent',
    value: function onEvent(event) {
      var _this3 = this;

      var _state3 = this.state;
      var entities = _state3.entities;
      var queue = _state3.queue;
      var inq = _state3.inq;
      var tmp = _state3.tmp;
      var options = _state3.options;

      if (entities[0].winner) return;
      if (!event) {
        inq = false;
        event = queue.splice(0, 1)[0];
        if (!event) {
          this.setState({ inq: inq });
          return;
        }
      }
      if (inq) {
        queue.push(event);
        this.setState({ options: event.options });
        return;
      }
      var minions = 0;
      var str = function str(e) {
        return e && entities[e] ? entities[e].str : e || '';
      };
      if (event.name != 'Object' && event.name != 'Process') {
        var _console;

        var m = event.end ? 'groupEnd' : 'group';
        (_console = console)[m].apply(_console, [event.name, str(event.source), str(event.target)].concat(_toConsumableArray(event.args)));
      }
      inq = true;
      tmp = tmp && tmp.tmp ? tmp : null;
      // let options = options || event;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = event.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var e = _step.value;

          if (!entities[e.id]) {
            entities[e.id] = e;
          }
          // e.green = !!options[e.id];
          e.green = !!options[e.id] && event.entities[0].owner == 1;
          e.targets = !!options[e.id] && !!options[e.id].length && options[e.id];
          if (entities[e.id].tmp) {
            entities[e.id].tmp = false;
          } else {
            for (var k in e) {
              entities[e.id][k] = e[k];
            }
          }
          if (e.zone == 3 && e.ally && e.isMinion) minions++;
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

      var me = entities[1] || entities[0];
      var slow = this.state.slow || event.name == 'Attack' || event.name == 'Turn' && event.source == 1;
      if (event.name == 'Play' && entities[event.source].card.id == 'Z_303') slow = 2;
      slow += !event.end;
      if (event.name == '/Summon' || event.name == '/Give') slow++;
      setTimeout(function (_) {
        return _this3.onEvent();
      }, (100 + slow * 500) * (window.slow ? 30 : 1));
      this.setState({ entities: entities, me: me, event: event, inq: inq, minions: minions, tmp: tmp, options: options });
      window.z = this.state;
    }
  }, {
    key: 'setState',
    value: function setState(state) {
      this.position(Object.assign({}, this.state, state));
      _get(Object.getPrototypeOf(Board.prototype), 'setState', this).call(this, state);
    }
  }, {
    key: 'position',
    value: function position(_ref) {
      var entities = _ref.entities;
      var source = _ref.source;
      var mouse = _ref.mouse;
      var coord = _ref.coord;
      var tmp = _ref.tmp;

      var x = [0, 77, 0, 0, 15],
          y = [0, 20, 46, 9, 27];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = entities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var e = _step2.value;

          if (e.tmpSpell) continue;
          var side = e.ally ? 1 : -1;
          var mc = !!(source && source.inHand && source.isMinion && mouse && e.ally && e.zone == 3 && mouse.y < 25);
          var p = e.position + (mc && e.position >= mouse.pos);
          if (tmp && e.ally && e.zone == 3 && e != tmp) {
            mc = true;
            p = e.position + (e.position >= tmp.position);
          }
          e.x = e.zone != 3 ? x[e.zone] : (p - (e.of + mc - 1) / 2) * 15 || 0;
          e.y = y[e.zone] * side + !!e.isPower;
          if (e.isHero) {
            e.y = side * 27.3;
          }
          var options = this.state.options[e.id];
          if (e == source && (!options || !options.length) && !e.isPower && mouse) {
            e.x = mouse.x;
            e.y = mouse.y;
          }
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
    }
  }, {
    key: 'mulligan',
    value: function mulligan() {
      var r = this.state.entities.filter(function (e) {
        return e.replace;
      }).map(function (e) {
        return (e.replace = 0) || e.id;
      });
      this.queueCommand('Mulligan', 1, r);
    }
  }, {
    key: 'coord',
    value: function coord(e) {
      var r = document.all.board.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width * 128 - 64).toFixed(2);
      var y = ((e.clientY - r.top) / r.height * 96 - 48).toFixed(2);
      var q = Math.round(x / 15 + (this.state.minions || 0) / 2);
      var p = Math.max(0, Math.min(q, this.state.minions || 0));
      return { x: x, y: y, p: p };
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _state4 = this.state;
      var me = _state4.me;
      var entities = _state4.entities;
      var detail = _state4.detail;
      var event = _state4.event;
      var arrow = _state4.arrow;
      var source = _state4.source;
      var mouse = _state4.mouse;
      var inq = _state4.inq;
      var queue = _state4.queue;
      var art = _state4.art;
      var options = _state4.options;

      if (!me.id) {
        var _ret = function () {
          var progs = { position: "absolute", top: "63rem", left: "50rem", width: "30rem", height: "4rem" };
          var progress = React.createElement('progress', { max: Object.keys(Cards).length, value: game.debug ? art.length : null, style: progs });
          var load = function load() {
            var keys = Object.keys(Cards);
            var n = art.length;
            if (n == keys.length) return;
            art.push(new Image());
            art[n].src = './img/cart/' + (Cards[keys[n]].art || keys[n].replace('Z_', '')) + '.jpg';
            art[n].onload = function (_) {
              return setTimeout(load, 1);
            };
            _this4.setState({ art: art });
            if (art.length == keys.length) _this4.queueCommand('Connect', 0);
          };
          var style = { position: "absolute", top: "50rem", left: "58rem" };
          var btn = React.createElement(
            'div',
            { className: 'topaz', key: 'con', style: style, autoFocus: true, onClick: function onClick(_) {
                inflate();load();load();load();
              } },
            'brawl'
          );
          return {
            v: React.createElement(
              'div',
              null,
              art.length ? progress : btn
            )
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
      var shroom = false;
      var b = entities.map(function (e) {
        var o = { shadow: e.id === detail };
        o.holding = e == source && !e.targets;
        o.vx = mouse && mouse.vx || 0;
        o.vy = mouse && mouse.vy || 0;
        if (event.name === 'Attack' && event.source === e.id) {
          var t = entities[event.target];
          var p = 2 * t.position - t.of + 7;
          var _s = e.ally ? 'e' : 'a';
          o.attack = 'a' + _s + 'm' + p.toString(16);
          o.attackX = t.x;
          o.attackY = t.y;
        }
        if (event.name === 'Deal' && event.target === e.id) o.hurt = event.args[0];
        if (event.name === 'Death' && event.target === e.id) o.death = true;
        if (event.name === '/Summon' && event.minion === e.id) o.summon = true;
        if (event.name === '/Give' && event.args[0] == e.id) o.appear = true;
        if (event.name === 'Discard' && event.target === e.id) o.discard = true;
        shroom = shroom || e.inPlay && e.card.id == 'Z_110';
        return React.createElement(Card, _extends({ key: e.id }, e, o));
      });
      var chicken = React.createElement('img', { key: 'chicken', src: 'img/chickenbp.png', style: { position: "absolute", left: "1rem", bottom: "1rem", width: "32rem", transform: 'rotate(1deg)' } });
      b = [React.createElement('div', { id: 'lines', key: 'lines' }), chicken].concat(_toConsumableArray(b));
      if (detail) {
        var e = { key: '_' + detail, detail: true };
        b.push(React.createElement(Card, _extends({}, entities[detail], e)));
      }
      if (me.mulligan) {
        var _style = { position: "absolute", top: "68rem", left: "56.7rem", zIndex: 99999 };
        b.push(React.createElement(
          'div',
          { className: 'topaz', key: 'mul', style: _style, onClick: this.mulligan.bind(this) },
          'mulligan'
        ));
      }
      var myTurn = !!options.turn && entities[0].owner == 1 && !!entities[1].crystals;
      var turnEnd = function turnEnd() {
        return !!options.turn && !options.mulligan && _this4.queueCommand('TurnEnd', 1);
      };
      b.push(React.createElement(
        'div',
        { className: "topaz turnEnd " + myTurn, key: 'turn', onClick: turnEnd },
        'end turn'
      ));
      if (source && source.targets) {
        arrow = { id: source.id, x: mouse.x, y: mouse.y };
      }
      if (arrow) {
        var t = entities[arrow.id];

        var _polar = polar(arrow.x - t.x, arrow.y - t.y);

        var angle = _polar.a;
        var r = _polar.r;

        var _style2 = {
          left: 64 + t.x + 'rem',
          top: 48 + t.y + 'rem',
          width: r + 'rem',
          transform: 'rotate(' + angle + 'rad)'
        };
        if (r > 3) b.push(React.createElement(
          'div',
          { key: 'arrow', id: 'arrow', style: _style2 },
          React.createElement('div', null)
        ));
      }
      var _arr2 = [me, entities[me.opponent]];
      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var p = _arr2[_i2];
        for (var i = 0; i < Math.max(p.mana, p.crystals); i++) {
          var mana = { width: '2rem', height: '2rem', border: "1px solid white", background: i < p.mana ? 'white' : '' };
          b.push(React.createElement('div', { key: 'mc' + p.ally + i, className: 'stat', style: _extends({ top: 46.8 + (p.ally ? 1 : -1) * (45.2 - i / 7) + 'rem', left: 97 + i * 2.8 + (i > 4) * 0.7 + (p.ally ? 0 : .3) + 'rem' }, mana) }));
        }
      }var s = entities[event.source];
      if (s && s.card && s.card.id == 'Z_102p' && event.name == 'Activate') {
        var _t = entities[event.target];

        var _polar2 = polar(_t.x - s.x, _t.y - s.y);

        var a = _polar2.a;
        var _r = _polar2.r;

        var _style3 = {
          left: 64 + s.x + 'rem', top: 48 + s.y + 'rem',
          transform: 'rotate(' + a + 'rad)',
          width: _r + 'rem'
        };
        var move = { transform: 'translate(' + (_r - 5) + 'rem, 0)' };
        b.push(React.createElement(
          'div',
          { key: 'vector', id: 'vector', style: _style3 },
          React.createElement('div', { style: move })
        ));
      }
      // [].find.call(document.styleSheets, s=>[].find.call(s.cssRules, r=>r.selectorText=='.101h.Activate'))
      if (entities[0].winner) {
        var res = entities[0].winner == me.id ? 'victory' : 'defeat';
        b.push(React.createElement(
          'div',
          { key: 'gameover', className: "topaz gameover " + res },
          res,
          '!'
        ));
      }
      var turn = event.name == 'Turn' && event.source == me.id;
      b.push(React.createElement(
        'div',
        { key: 'yturn', className: "topaz turn " + turn },
        'your turn'
      ));
      b.push(React.createElement(
        'div',
        { key: 'firesmash', className: 'firesmash' },
        '.'
      ));

      var global = [];
      if (event.name == 'Play' && entities[event.source].card.id == 'Z_303') global.push('firesmash');
      if (shroom) global.push('shroom');
      if (event.name == 'Attack') global.push('battle');
      if (me.mulligan) global.push('darken');
      if (entities[0].winner) global.push('gameover');
      global = global.join(' ');
      if (document.body.className !== global) document.body.className = global;
      return React.createElement(
        'div',
        { style: { height: "100%", width: "100%" } },
        b
      );
    }
  }]);

  return Board;
}(React.Component);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Card = function (_React$Component2) {
  _inherits(Card, _React$Component2);

  function Card() {
    _classCallCheck(this, Card);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Card).apply(this, arguments));
  }

  _createClass(Card, [{
    key: 'render',
    value: function render() {
      var props = this.props;var ul = [];var style = {};
      var scale = .5;
      if (!props.zone) return null;
      var side = props.ally ? 1 : -1;
      var bounds = { transform: 'translate(' + props.x + 'rem, ' + props.y + 'rem)' };
      bounds.zIndex = 10 + (props.position || 0) + 100 * (props.zone > 1) + 100 * !!props.attack + 1000 * (props.zone == 2);
      if (props.detail && !props.holding) {
        scale *= 2;
        if (props.zone == 3) bounds.transform += ' translateX(-12.5rem)';
        style.pointerEvents = 'none';
      }
      if (props.zone === 2) {
        if (props.holding) {
          bounds.transition = 'transform 0s';
          var vx = Math.max(-40, Math.min(13 * props.vx, 40));
          var vy = Math.max(-30, Math.min(-7 * props.vy, 30));
          bounds.transform += ' rotateY(' + vx + 'deg) rotateX(' + vy + 'deg) translateZ(.5rem)';
          if (!props.mulligan) style.boxShadow = '13rem 13rem 3px rgba(0,0,0,.1)';
        } else if (!props.detail) {
          if (props.of <= 3) {
            var t = (props.position - (props.of - 1) / 2) * 14;
            bounds.transform += ' translateX(' + t + 'rem)';
          } else {
            var r = 50 / props.of - 2 * (props.of == 4);
            var a = side * (props.position - (props.of - 1) / 2) * r;
            var x = side * Math.sin(a / 180 * Math.PI) * 64;
            var y = side * (64 - Math.cos(a / 180 * Math.PI) * 64);
            bounds.transform += ' translate(' + x + 'rem, ' + y + 'rem) rotate(' + a + 'deg)';
            // style.webkitFilter = 'blur(1px)';
          }
        } else {
            var _r2 = 27 / props.of;
            var _a = (props.position - (props.of - 1) / 2) * _r2;
            bounds.transform += ' translate(' + 2 * _a + 'rem, ' + (0.67 - 11.67 * side) + 'em)';
            bounds.zIndex = 2000;
          }
      }
      if (props.shadow && props.zone == 2) bounds.opacity = 0;
      if (props.isHero) bounds.transform = 'translate(0, ' + (2 * props.ally - 1) * 28 + 'rem) scale(1.20, 1.10)';
      if (props.mulligan && props.ally && props.zone == 2) {
        var _r3 = 60 / props.mulligan + 15;
        var _t2 = (props.position - (props.mulligan - 1) / 2) * _r3;
        bounds = { transform: 'translate(' + _t2 + 'rem, 0)', zIndex: 9000 };
        scale *= 2;
      }
      var classes = 'green replace isHero isMinion isPower inDeck inHand inPlay summon death mulligan appear discard taunt';
      var className = classes.split(' ').filter(function (c) {
        return props[c];
      }).join(' ');
      var onMouse = function onMouse(e) {
        return props.on(e.type == 'mouseenter' && props.id);
      };
      if (props.attack) {
        var _polar3 = polar(props.attackX - props.x, props.attackY - props.y);

        var _a2 = _polar3.a;
        var _r4 = _polar3.r;

        style.transform = ' translate(' + 2 * (_r4 - 7) * Math.cos(_a2) + 'rem, ' + 2 * (_r4 - 7) * Math.sin(_a2) + 'rem)';
        className += ' attack2';
      }
      style.backgroundImage = 'url(img/cart/' + props.art + '.jpg)';
      ul.push(React.createElement(
        'div',
        { key: 'rim', className: 'rim' },
        React.createElement(
          'div',
          { className: 'rim' },
          React.createElement('div', { className: 'rim' })
        )
      ));
      if (props.text) ul.push(React.createElement(
        'div',
        { key: 'cardText', className: 'cardText' },
        React.createElement('span', { dangerouslySetInnerHTML: { __html: props.text } })
      ));
      if (props.taunt) ul.push(React.createElement('div', { key: 'taunt', className: 'taunt' }));
      if (props.charge) ul.push(React.createElement('div', { key: 'charge', className: 'charge' }));
      if (props.stealth) {
        style.backgroundImage = 'linear-gradient(to bottom, rgba(127,127,127,.4) 10%, rgba(127,127,127,.95) 70%), ' + style.backgroundImage;
        ul.push(React.createElement('div', { key: 'stealth', className: 'stealth' }));
      }
      if (props.hurt) {
        ul.push(React.createElement(
          'div',
          { key: 'hurt', className: 'hurt' },
          React.createElement(
            'div',
            null,
            props.hurt
          )
        ));
      }
      if (props.health) ul.push(React.createElement(
        'span',
        { key: 'health', className: 'stat health' },
        props.health - props.damage
      ));
      if (props.attack || !props.isHero && 'atk' in props) ul.push(React.createElement(
        'span',
        { key: 'atk', className: 'stat atk' },
        props.atk
      ));
      if (props.zone != 3) ul.push(React.createElement(
        'span',
        { key: 'cost', className: 'stat cost' },
        props.cost
      ));
      if (props.isPower) {
        bounds.transform += ' scale(.8, .6)';
        style.borderRadius = '50%';
      }
      var back = { transform: props.ally ? ' rotateY(-180deg)' : ' rotateX(-180deg)' };
      if (props.ally && props.inDeck) {
        style.transform = ' rotateY(-180deg)';
        back.transform += ' rotateY(-180deg)';
      }
      if (!props.ally && !props.inPlay && !props.isPower && !game.debug) {
        style.transform = ' rotateX(-180deg)';
        back.transform += ' rotateX(-180deg)';
      }
      if (props.tmpSpell && !props.targets) {
        scale = 1;
        bounds.transition = 'transform 0s';
        bounds.transform = ' translate(' + props.x + 'rem, ' + props.y + 'rem)';
      }
      bounds.transform += ' scale(' + scale + ')';
      var title = game.debug ? props.str : '';
      return React.createElement(
        'div',
        { key: props.id, id: props.id, className: 'bounds', style: bounds, title: title },
        React.createElement(
          'ul',
          { className: className, style: style },
          ul
        ),
        React.createElement('div', { className: 'back', style: back })
      );
    }
  }]);

  return Card;
}(React.Component);

function polar(x, y) {
  return { a: Math.PI / 2 - Math.atan2(x, y), r: Math.sqrt(x * x + y * y) };
}

function throttle(handler) {
  var done = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  return function (e) {
    done && ((done = 0) || requestAnimationFrame(function (_) {
      return (done = 1) && handler(e);
    }));
    e.preventDefault();
  };
}

ReactDOM.render(React.createElement(Board, null), board);

'yg nys ber kay atta mart wy rat pat dave ';