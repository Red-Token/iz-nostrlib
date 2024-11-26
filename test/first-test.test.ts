import { expect } from 'chai';

describe('Async Test Example', () => {
    it('should complete an async operation', async () => {
        const asyncOperation = async () => {
            return new Promise<string>((resolve) => {
                setTimeout(() => resolve('expected result'), 1000);
            });
        };

        const result = await asyncOperation();
        expect(result).to.equal('expected result');
    });

    it('should handle async errors', async () => {
        const asyncOperationThatFails = async () => {
            return new Promise((_, reject) => {
                setTimeout(() => reject(new Error('expected error')), 1000);
            });
        };

        try {
            await asyncOperationThatFails();
            throw new Error('Test should have thrown an error');
        } catch (error: any) {
            expect(error.message).to.equal('expected error');
        }
    });
});
