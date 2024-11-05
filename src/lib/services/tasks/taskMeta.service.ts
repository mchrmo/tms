import prisma from "@/lib/prisma"

const add_meta = async (task_id: number, key: string, value: string) => {
  const meta = await prisma.taskMeta.create({
    data: {
      key,
      value,
      task_id
    }
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
  add_meta,
  remove_meta
} 

export default taskMetaService