import { createClerkClient } from '@clerk/clerk-sdk-node'
import { Organization, Prisma, PrismaClient, User, UserRole } from '@prisma/client'
const prisma = new PrismaClient()

// Dev
const clerkClient = createClerkClient({ secretKey: 'sk_test_iPbWjrbS97Qa0oEoGmBpNCDw7V20NOsYbTAemEPJcM' })

// Prod
// const clerkClient = createClerkClient({ secretKey: 'sk_live_pdArwwQ2uK0zpDBTCXyUmfOfTLVjqri59u1Arzj7Ro' })


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

const orgMembers: Prisma.OrganizationMemberCreateInput[] = [
  {
    position_name: 'Primátor',
    organization: {
      connect: {
        name: 'Mesto Ružomberok'
      }
    },
    user: {
      connect: {
        email: 'mchrmo@gmail.com'
      }
    }
  },
  {
    position_name: 'Prednosta',
    organization: {
      connect: {
        name: 'Mestský úrad'
      }
    },
    user: {
      connect: {
        email: 'natalia.jarottova63@gmail.com'
      }
    },
    manager: {
      connect: {
        id: 1
      }
    }
  },
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
  console.log(`${createdRoles.length} user roles created.`);

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

  console.log(`${createdOrgs.length} organizations created.`);

  // seed clerk users
  const clerkUsers = await clerkClient.users.getUserList()
  const createdUsers = []
  for (const clerkUser of clerkUsers.data) {

    const role = clerkUser.publicMetadata && clerkUser.publicMetadata.role && clerkUser.publicMetadata.role
    if(!role) continue
    const role_id = (role as any).id

    const email = clerkUser.emailAddresses.length ? clerkUser.emailAddresses[0].emailAddress : null
    if(!email) continue



    const newUser = await prisma.user.upsert({
      create: {
        email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`,
        clerk_id: clerkUser.id,
        role_id
      },
      update: {},
      where: {
        clerk_id: clerkUser.id
      }
    })
    createdUsers.push(newUser)
  }
  

  console.log(`${createdUsers.length} users created.`);


  // seed org members
  const createdOrgMembers = []
  for (const orgMember of orgMembers) {
    const newOrgMember = await prisma.organizationMember.create({
      data: orgMember
    })

    createdOrgMembers.push(newOrgMember)
  }


  console.log(`${createdOrgMembers.length} members created.`);

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