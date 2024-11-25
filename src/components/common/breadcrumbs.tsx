'use client'

import React, { ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon, Regex } from 'lucide-react'
import { Separator } from '../ui/separator'



const pathLabels: { label: string, matcher: string | RegExp }[] = [
    {
        label: "Úlohy",
        matcher: /^\/tasks$/
    },
    {
        label: "Detail",
        matcher: /^\/tasks\/\d+$/
    },
    {
        label: "Nová úloha",
        matcher: /^\/tasks\/create$/
    },
    {
        label: "Porady",
        matcher: /^\/meetings$/
    },
    {
        label: "Vyhladávanie bodov",
        matcher: /^\/meetings\/search$/
    },
    {
        label: "Bod porady",
        matcher: /^\/meetings\/items\/\d+$/
    },
    {
        label: "Detail porady",
        matcher: /^\/meetings\/\d+$/
    },
    {
        label: "Detail úlohy",
        matcher: /^\/tasks\/\d+$/
    },
    {
        label: "Organizácie",
        matcher: /^\/organizations$/
    },
    {
        label: "Profil",
        matcher: /^\/profile$/
    },
    {
        label: "Užívatelia",
        matcher: /^\/users$/
    },
    {
        label: "Detail",
        matcher: /^\/users\/\d+$/
    }
]


const NextBreadcrumb = () => {

    const paths = usePathname()
    const pathNames = paths.split('/').filter(path => path)

    if(paths.length == 1) {
        return 
    }

    return (
        <div className='space-y-5 mb-5'>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/"><HomeIcon size={20} /></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {/* {pathNames.length > 0 && <BreadcrumbSeparator />} */}

                    {
                        pathNames.map((link, index) => {
                            let href = `/${pathNames.slice(0, index + 1).join('/')}`
                            let itemLink;

                            const pathLabel = pathLabels.find(p => href.match(p.matcher))
                            if (pathLabel) itemLink = pathLabel.label

                            return (
                                <React.Fragment key={index}>
                                    {
                                        itemLink && (
                                            <>
                                                <BreadcrumbItem className='text-md'>
                                                    <BreadcrumbLink href={href}>{itemLink}</BreadcrumbLink>
                                                </BreadcrumbItem>
                                                {pathNames.length !== index + 1 && <BreadcrumbSeparator />}
                                            </>
                                        )
                                    }
                                </React.Fragment>
                            )
                        })
                    }
                </BreadcrumbList>
            </Breadcrumb>
            <Separator />
        </div>
    )
}

export default NextBreadcrumb