import { CreateAvailabilitySchema, UpdateAvailabilitySchema } from '../validators/availabilityValidators';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error('Test failed:', message);
        process.exitCode = 1;
    }
}

async function run() {
    console.log('Running availability validators tests...');

    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);

    // valid payload
    const valid = {
        startTime: now.toISOString(),
        endTime: later.toISOString(),
        type: 'available',
        recurring: false
    };

    const res1 = CreateAvailabilitySchema.safeParse(valid);
    assert(res1.success, 'CreateAvailabilitySchema should accept a valid payload');

    // invalid: end before start
    const invalid = {
        startTime: later.toISOString(),
        endTime: now.toISOString(),
        type: 'available'
    };

    const res2 = CreateAvailabilitySchema.safeParse(invalid);
    assert(!res2.success, 'CreateAvailabilitySchema should reject endTime before startTime');

    // Update schema accepts partial
    const res3 = UpdateAvailabilitySchema.safeParse({ endTime: later.toISOString() });
    assert(res3.success, 'UpdateAvailabilitySchema should accept partial updates');

    if (process.exitCode === 1) {
        console.error('Some tests failed');
        process.exit(1);
    }

    console.log('All validator tests passed');
}

run().catch(err => { console.error(err); process.exit(1); });
