'use strict';

const { Parser } = require('chevrotain');
const { allTokens } = require('./tokens');

const [
  _,
  LastOperator,
  SumOperator,
  AverageOperator,
  LengthConstant,
  PlusOperator,
  MinusOperator,
  MultiplicationOperator,
  DivisionOperator,
  OpeningParen,
  ClosingParen,
  NumberLiteral,
  StringLiteral
] = allTokens;

class AggregatorParser extends Parser {
  constructor(input) {
    super(input, allTokens, { outputCst: true });

    const $ = this;

    $.RULE('additionExpression', () => {
      $.SUBRULE($.minusExpression, { LABEL: 'lhs'});
      $.MANY(() => {
        $.CONSUME(PlusOperator);
        $.SUBRULE2($.minusExpression, { LABEL: 'rhs'});
      });
    });

    $.RULE('minusExpression', () => {
      $.SUBRULE($.multiplicationExpression, { LABEL: 'lhs' });
      $.MANY(() => {
        $.CONSUME(MinusOperator);
        $.SUBRULE2($.multiplicationExpression, { LABEL: 'rhs' });
      });
    });

    $.RULE('multiplicationExpression', () => {
      $.SUBRULE($.divisionExpression, { LABEL: 'lhs' });
      $.MANY(() => {
        $.CONSUME(MultiplicationOperator);
        $.SUBRULE2($.divisionExpression, { LABEL: 'rhs'});
      });
    });

    $.RULE('divisionExpression', () => {
      $.SUBRULE($.binaryOperandExpression, { LABEL: 'lhs' });
      $.MANY(() => {
        $.CONSUME(DivisionOperator);
        $.SUBRULE2($.binaryOperandExpression, { LABEL: 'rhs'});
      });
    });

    $.RULE('binaryOperandExpression', () => {
      $.OR([
        { ALT: () => $.SUBRULE($.lastOperation, { LABEL: 'expression' }) },
        { ALT: () => $.SUBRULE($.sumOperation, { LABEL: 'expression' }) },
        { ALT: () => $.SUBRULE($.averageOperation, { LABEL: 'expression' }) },
        { ALT: () => $.SUBRULE($.lengthConstant, { LABEL: 'expression' }) },
        { ALT: () => $.SUBRULE($.parenthesisExpression, { LABEL: 'expression' }) },
        { ALT: () => $.SUBRULE($.numberExpression, { LABEL: 'expression'}) },
      ]);
    });

    $.RULE('lastOperation', () => {
      $.CONSUME(LastOperator);
      $.SUBRULE($.stringExpression);
    });

    $.RULE('sumOperation', () => {
      $.CONSUME(SumOperator);
      $.SUBRULE($.stringExpression);
    });

    $.RULE('averageOperation', () => {
      $.CONSUME(AverageOperator);
      $.SUBRULE($.stringExpression);
    });

    $.RULE('lengthConstant', () => {
      $.CONSUME(LengthConstant);
    });

    $.RULE('parenthesisExpression', () => {
      $.CONSUME(OpeningParen);
      $.SUBRULE($.additionExpression);
      $.CONSUME(ClosingParen);
    });

    $.RULE('numberExpression', () => {
      $.CONSUME(NumberLiteral);
    });

    $.RULE('stringExpression', () => {
      $.CONSUME(StringLiteral);
    });

    this.performSelfAnalysis();
  }
}

module.exports = AggregatorParser;
