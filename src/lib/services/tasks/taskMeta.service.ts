import prisma from "@/lib/prisma"

const update_meta = async (task_id: number, key: string, value: string) => {
  const meta = await prisma.taskMeta.upsert({
    where: {
      task_id_key: { // Unique constraint composite field
        task_id,
        key,
      },
    },
    create: {
      key,
      value,
      task_id
    },
    update: {
      value: value,
    },
  })
  return meta
}

const remove_meta = async (task_id: number, key: string) => {
  await prisma.taskMeta.deleteMany({
    where: {
      key,
      task_id
    }
  })
}

const taskMetaService = {
  update_meta,
  remove_meta
} 

export default taskMetaService