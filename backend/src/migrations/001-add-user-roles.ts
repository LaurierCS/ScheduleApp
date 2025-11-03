/**
 * Migration Script: Add Role Field to Existing Users
 * 
 * This script updates all existing users in the database to have a role field.
 * Run this script once after deploying the enhanced User model.
 * 
 * Purpose:
 * - Assigns default role (CANDIDATE) to users without a role
 * - Ensures all users have a valid role for RBAC system
 * - Can be customized to assign specific roles based on criteria
 * 
 * Usage:
 * From backend directory:
 *   npx ts-node src/migrations/001-add-user-roles.ts
 * 
 * Or add to package.json scripts:
 *   "migrate:roles": "ts-node src/migrations/001-add-user-roles.ts"
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/user';
import { logInfo, logError, logWarning } from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Main migration function
 * Updates all users without a role to have the default CANDIDATE role
 */
async function migrateUserRoles() {
    try {
        logInfo('Starting user role migration...');

        // Connect to database
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        logInfo('Connected to MongoDB');

        // Find all users without a role or with null role
        const usersWithoutRole = await User.find({
            $or: [
                { role: { $exists: false } },
                { role: null }
            ]
        });

        logInfo(`Found ${usersWithoutRole.length} users without roles`);

        if (usersWithoutRole.length === 0) {
            logInfo('No users need migration. All users already have roles.');
            return;
        }

        // Update each user
        let updatedCount = 0;
        let failedCount = 0;

        for (const user of usersWithoutRole) {
            try {
                // Set default role to CANDIDATE
                // You can customize this logic based on your needs
                user.role = UserRole.CANDIDATE;

                await user.save();
                updatedCount++;

                logInfo(`✓ Updated user: ${user.email} → ${UserRole.CANDIDATE}`);
            } catch (error) {
                failedCount++;
                logError(error as Error, `Failed to update user: ${user.email}`);
            }
        }

        // Summary
        logInfo('\n=== Migration Summary ===');
        logInfo(`Total users processed: ${usersWithoutRole.length}`);
        logInfo(`Successfully updated: ${updatedCount}`);
        if (failedCount > 0) {
            logWarning(`Failed updates: ${failedCount}`);
        }
        logInfo('=========================\n');

        // Verify migration
        const remainingUsersWithoutRole = await User.countDocuments({
            $or: [
                { role: { $exists: false } },
                { role: null }
            ]
        });

        if (remainingUsersWithoutRole > 0) {
            logWarning(`Warning: ${remainingUsersWithoutRole} users still without roles`);
        } else {
            logInfo('✓ All users now have roles assigned!');
        }

        // Display role distribution
        const roleStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        logInfo('\nRole Distribution:');
        roleStats.forEach(stat => {
            logInfo(`  ${stat._id}: ${stat.count} users`);
        });

    } catch (error) {
        logError(error as Error, 'Migration failed');
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        logInfo('Database connection closed');
    }
}



// Run the migration
migrateUserRoles()
    .then(() => {
        logInfo('Migration script completed');
        process.exit(0);
    })
    .catch((error) => {
        logError(error, 'Migration script failed');
        process.exit(1);
    });
