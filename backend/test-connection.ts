import { PrismaClient } from '@prisma/client'

// Test 1: Direct connection
async function testDirect() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_xalZi6Kuw5LN@ep-royal-recipe-ao816pzs.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
      }
    }
  })
  
  console.log('🔵 Testing DIRECT connection...')
  try {
    await prisma.$connect()
    console.log('✅ DIRECT connection works!')
    await prisma.$disconnect()
    return true
  } catch (error: any) {
    console.log('❌ DIRECT connection failed:', error?.errorCode)
    await prisma.$disconnect()
    return false
  }
}

// Test 2: Pooled connection
async function testPooled() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_xalZi6Kuw5LN@ep-royal-recipe-ao816pzs-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
      }
    }
  })
  
  console.log('🟢 Testing POOLED connection...')
  try {
    await prisma.$connect()
    console.log('✅ POOLED connection works!')
    await prisma.$disconnect()
    return true
  } catch (error: any) {
    console.log('❌ POOLED connection failed:', error?.errorCode)
    await prisma.$disconnect()
    return false
  }
}

async function runTests() {
  console.log('=== CONNECTION TESTS ===\n')
  
  const directWorks = await testDirect()
  console.log('')
  const pooledWorks = await testPooled()
  
  console.log('\n=== RESULTS ===')
  console.log('Direct:', directWorks ? '✅ WORKS' : '❌ FAILS')
  console.log('Pooled:', pooledWorks ? '✅ WORKS' : '❌ FAILS')
  
  if (!directWorks && !pooledWorks) {
    console.log('\n🚨 BOTH failed! Most likely:')
    console.log('1. Database is sleeping/frozen in Neon')
    console.log('2. Your IP is blocked by Neon firewall')
    console.log('3. Neon service is down in your region')
    console.log('\nACTION: Open Neon Console and:')
    console.log('- Wake up the database')
    console.log('- Check Settings → IP Allow')
  }
}

runTests()