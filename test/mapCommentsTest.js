import expect from 'expect.js';
import fs from 'fs';

import { mapComments } from '../src/mapComments';

describe('MapComments', () => {
    const filePath = 'test/contracts/OZERC20.sol';
    let comments = '';

    before(() => {
        // read file
        const input = fs.readFileSync(filePath).toString();
        // get filtered comments
        comments = mapComments(input);
    });

    it('extract single line no param/return valid comments', () => {
        // verify
        expect(comments.get('totalSupply').dev.trim()).to.be('Total number of tokens in existence');
    });
    it('extract single line w/ param/return valid comments', () => {
        // verify
        expect(comments.get('balanceOf').dev.trim()).to.be('Gets the balance of the specified address.');
    });
    it('extract multiline line w/ param/return valid comments', () => {
        // verify
        expect(comments.get('transferFrom').dev.trim()).to.be('Transfer tokens from one address to another. '
            + 'Note that while this function emits an Approval event, this is not required as per the '
            + 'specification, and other compliant implementations may not emit the event.');
    });
    it('extract multiline line w/ code in valid comments', () => {
        // verify
        expect(comments.get('decreaseAllowance').dev.trim()).to.be('Decrease the amount of tokens that an '
            + 'owner allowed to a spender. approve should be called when '
            + '_allowed[msg.sender][spender] == 0. To decrement allowed value is better '
            + 'to use this function to avoid 2 calls (and wait until the first transaction is '
            + 'mined) From MonolithDAO Token.sol Emits an Approval event.');
    });
    it('extract multiline line w/ link in valid comments', () => {
        // verify
        expect(comments.get('approve').dev.trim()).to.be('Approve the passed address to spend the '
            + 'specified amount of tokens on behalf of msg.sender. Beware that changing an '
            + 'allowance with this method brings the risk that someone may use both the old '
            + 'and the new allowance by unfortunate transaction ordering. One possible '
            + "solution to mitigate this race condition is to first reduce the spender's "
            + 'allowance to 0 and set the desired value afterwards: https://github.com'
            + '/ethereum/EIPs/issues/20#issuecomment-263524729');
    });
    it('extract single line w/ _ in function name valid comments', () => {
        // verify
        expect(comments.get('_transfer').dev.trim()).to.be('Transfer token for a specified addresses');
    });
});
