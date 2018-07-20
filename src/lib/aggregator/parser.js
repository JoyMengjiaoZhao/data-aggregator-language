const { tokens, allTokens } = require('./tokens');
const { Parser } = require('chevrotain');

class AggregatorParser extends Parser {
  constructor(input) {
    super(input, allTokens, { outputCst: true });

    const $ = this;

    $.RULE('expression', () => {
      $.SUBRULE($.unaryExpression);
    });

    $.RULE('unaryExpression', () => {
      $.CONSUME(tokens.LastOperator);
      $.CONSUME(tokens.StringLiteral);
    });

    this.performSelfAnalysis();
  }
}

module.exports = AggregatorParser;
