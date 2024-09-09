import { Organization, Prisma, PrismaClient, User, UserRole } from '@prisma/client'
const prisma = new PrismaClient()

const userRoles: UserRole[] = [
  {id: 1, name: "admin"},
  {id: 2, name: "employee"}
]

const organizations: Prisma.OrganizationCreateInput[] = [
  {
    name: "Mesto Ružomberok",
    type: "main"
  },
  {
    name: "Mestský úrad",
    type: "main",
    parent: {
      connect: {
        name: "Mesto Ružomberok"
      }
    }
  },
  {
    name: "Grantové oddelenie",
    type: "main",
    parent: {
      connect: {
        name: "Mestský úrad"
      }
    }
  },
  {
    name: "Legislatívne oddelenie",
    type: "main",
    parent: {
      connect: {
        name: "Mestský úrad"
      }
    }
  },
  {
    name: "Ekonomické oddelenie",
    type: "main",
    parent: {
      connect: {
        name: "Mestský úrad"
      }
    }
  }
]

async function main() {

  // seed roles
  const createdRoles = []
  for (const role of userRoles) {
    const newRole = await prisma.userRole.upsert({
      create: {
        id: role.id,
        name: role.name
      },
      update: {},
      where: {
        id: role.id
      }
    })

    createdRoles.push(role)
  }

  // seed oranizations
  const createdOrgs = []
  for (const org of organizations) {
    const newOrg = await prisma.organization.upsert({
      create: org,
      update: {},
      where: {
        name: org.name
      }
    })

    createdOrgs.push(newOrg)
  }
  
  console.log(`${createdOrgs.length} user roles created.`);
  

  // await prisma.organization.upsert({
  //   create: {
  //     name: "Mestský úrad",
  //     type: "main",
  //     parent: {
  //       connect: {
  //         name: "Mesto Ružomberok"
  //       }
  //     }
  //   },
  //   update: {},
  //   where: {
  //     name: "Mestský úrad"
  //   }
  // })
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })