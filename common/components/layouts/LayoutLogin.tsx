import { Box } from '@mui/material'
import Head from 'next/head'
import { FC, PropsWithChildren } from 'react'

import Toolbar from '@mui/material/Toolbar'
import { NavbarLogin } from '../ui/navbars/NavbarLogin'
import { siteName } from '../../utils'
import { NavbarLoginCustom } from '../ui/navbars/NavbarLoginCustom'

interface Props {
  title?: string
}

export const LayoutLogin: FC<PropsWithChildren<Props>> = ({
  title = siteName(),
  children,
}) => {
  return (
    <>
      {
        <Box sx={{ display: 'flex' }}>
          <Head>
            <title>{title}</title>
          </Head>

          <NavbarLoginCustom />

          <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
            <Toolbar />
            {children}
          </Box>
        </Box>
      }
    </>
  )
}
