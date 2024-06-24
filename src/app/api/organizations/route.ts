import { getMainOrganization } from '@/lib/db/organizations';
import { NextResponse } from 'next/server';

export const GET = async () => {

    // auth().protect()
    const data = await getMainOrganization()
    
    return NextResponse.json(data, { status: 200 });
};