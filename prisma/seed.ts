import { PrismaClient } from '@prisma/client'
import { ROLE_PERMISSIONS, ALL_ROLES } from '../lib/roles'

const prisma = new PrismaClient()

async function main() {
  for (const roleName of ALL_ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {
        permissions: ROLE_PERMISSIONS[roleName],
      },
      create: {
        name: roleName,
        permissions: ROLE_PERMISSIONS[roleName],
      },
    })
  }
  console.log('Seeded roles:', ALL_ROLES.join(', '))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
