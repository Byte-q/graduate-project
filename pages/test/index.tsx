import React from 'react'

async function index() {

  const res = await fetch('http://localhost:3500/server/api/me/');
  const data = await res.json()
    
  return (
    <main>
      <div>
        
      </div>
    </main>
  )
}

export default index