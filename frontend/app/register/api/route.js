import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();

        if (body) {
            const existingDonator = await prisma.donator.findFirst({
                where: {
                    OR: [
                        { hash: body.hash },
                        { address: body.address }
                    ]
                }
            });

            if (existingDonator) {
                return NextResponse.json({
                    ...existingDonator,
                    message: "Donator already exists"
                });
            }

            const donator = await prisma.donator.create({
                data: {
                    hash: body.hash,
                    address: body.address
                }
            })

            return NextResponse.json(donator);
        }

    } catch (error) {
        return NextResponse.json({
            error: error.message,
            message: "There was an error parsing the JSON request body"
        }, { status: 500 });
    }
}

// export async function GET(request, { params }) {

    // try {
    //     const { id } = params;
    //     const donor = await prisma.donator.findUnique({
    //         where: { id }
    //     });
    //
    //     if (!donor) {
    //         return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    //     }
    //
    //     return NextResponse.json(donor);
    // } catch (error) {
    //     return NextResponse.json({ error: error.message }, { status: 500 });
    // }
// }