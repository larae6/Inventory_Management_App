'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { firestore } from './firebase'
import { Timestamp } from 'firebase/firestore'; 

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {

  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([]) 
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [itemDescription, setItemDescription] = useState(''); 
  const [itemExpiration, setItemExpiration] = useState(null); 


  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []

    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })

    setInventory(inventoryList)
    setFilteredInventory(inventoryList) 
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredInventory(inventory)
    } else {
      setFilteredInventory(
        inventory.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [searchQuery, inventory])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data();
      const newQuantity = (data.quantity || 0) + 1;
      await setDoc(docRef, { 
        quantity: newQuantity, 
        description: data.description, 
        expiration: data.expiration 
      }, { merge: true })
    } else {
      await setDoc(docRef, { 
        quantity: 1, 
        description: itemDescription, 
        expiration: itemExpiration instanceof Date ? Timestamp.fromDate(itemExpiration) : itemExpiration 
      });
    }

    setItemName(''); 
    setItemDescription('');
    setItemExpiration(null); 
    handleClose(); 

    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data();
      const newQuantity = (data.quantity || 0) - 1;
      if (newQuantity <= 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { 
          quantity: newQuantity, 
          description: data.description, 
          expiration: data.expiration 
        }, { merge: true });
      }
    }
    await updateInventory()
  }
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>

    <Box
      width="100vw"
      minHeight="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}

      bgcolor={'black'} 
    > 

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} fontFamily={'Courier New, monospace'}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2} >
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            
            <TextField 
              id="outlined-basic"
              label="Description" 
              variant="outlined"
              fullWidth
              value={itemDescription} 
              onChange={(e) => setItemDescription(e.target.value)} 
            /> 

            <DatePicker
              label="Expiration"
              value={itemExpiration}
              onChange={(date) => setItemExpiration(date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />

            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)             
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      <Stack
        width="900px"
        height="230px"
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={2}
      >
        <Typography variant={'h1'} color={'#E0BFB8'} sx={{ fontFamily: 'Courier New, monospace' }}>
          My Pantry 
        </Typography>

        <TextField
          id="search"
          label="Search the Pantry"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            sx: {
              color: '#FFC0CB', 
            },
          }}
          InputLabelProps={{
            sx: {
              color: '#FFC0CB', 
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#FFC0CB', 
              },
              '&:hover fieldset': {
                borderColor: '#A7C7E7', 
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white', 
              },
            },
            '& .MuiInputLabel-root': {
              color: '#A7C7E7', 
            },
          }}
        />

      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          textTransform: 'capitalize',
          backgroundColor: '#FFB6C1', 
          color: 'black', 
          '&:hover': {
            backgroundColor: '#F33A6A', 
          },
          '&:active': {
            backgroundColor: '#F33A6A', 
          },
          '&:focus': {
            outline: 'none', 

          },
        }}
      >
        Add New Item
      </Button>

      </Stack>
      <Box border={'1px solid #333'}>
        
        <Stack width="900px" height="300px" spacing={2} overflow={'auto'}>
          {filteredInventory.map(({name, quantity, description, expiration}) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'black'} //color of rectangles
              paddingX={5}
            >
              <Typography variant={'h5'} color={'#FAA0A0'} textAlign={'center'} sx={{ fontFamily: 'Courier New, monospace' }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              
              <Stack direction="column">
                <Typography variant={'h6'} color={'#FAA0A0'} textAlign={'center'} sx={{ fontFamily: 'Courier New, monospace' }}>
                  Description: {description}
                </Typography>

                <Typography variant={'h6'} color={'#FAA0A0'} textAlign={'center'} sx={{ fontFamily: 'Courier New, monospace' }}>
                  Quantity: {quantity}
                </Typography>

                <Typography variant={'h6'} color={'#FAA0A0'} textAlign={'center'} sx={{ fontFamily: 'Courier New, monospace' }}>   
                  Expiration Date: {expiration ? expiration.toDate().toLocaleDateString() : 'N/A'} 
                </Typography>
              </Stack>

              <Stack spacing={2} direction="column">
                <Button
                  variant="contained"
                  onClick={() => addItem(name)}
        
                  sx={{
                    textTransform: 'capitalize',
                    backgroundColor: '#FFB6C1', 
                    color: 'black', 
                    '&:hover': {
                      backgroundColor: '#F33A6A', 
                    },
                    '&:active': {
                      backgroundColor: '#F33A6A', 
                    },
                    '&:focus': {
                      outline: 'none', 

                    },
                  }}   
                >
                  + 
                </Button>

                <Button
                  variant="contained"
                  onClick={() => addItem(name)}
                  
                  sx={{
                    textTransform: 'capitalize',
                    backgroundColor: '#FFB6C1', 
                    color: 'black', 
                    '&:hover': {
                      backgroundColor: '#F33A6A', 
                    },
                    '&:active': {
                      backgroundColor: '#F33A6A', 
                    },
                    '&:focus': {
                      outline: 'none', 

                    },
                  }}   
                >
                  -
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
    </LocalizationProvider>
  ) 
}