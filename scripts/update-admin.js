
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const email = 'resonate.admin8153@protonmail.com';
const password = 'linkedingen73043341379821508153';

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

async function main() {
    console.log(`Updating password for ${email}...`);
    try {
        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found, creating...');
            await prisma.adminUser.create({
                data: {
                    email,
                    passwordHash: hashPassword(password)
                }
            });
        } else {
            console.log('User found, updating...');
            await prisma.adminUser.update({
                where: { email },
                data: { passwordHash: hashPassword(password) }
            });
        }
        console.log('Done.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
