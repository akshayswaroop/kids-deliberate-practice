#!/bin/bash

# Comprehensive Development Validation Script
# This script catches both build-time and runtime errors systematically

set -e  # Exit on any error

echo "🔍 Starting comprehensive validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build Validation
echo -e "${YELLOW}📦 Step 1: Building project...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed - fix TypeScript errors first${NC}"
    exit 1
fi

# Step 2: Test Validation  
echo -e "${YELLOW}🧪 Step 2: Running tests...${NC}"
if npm test -- --run; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed - fix failing tests${NC}"
    exit 1
fi

# Step 3: Runtime Validation
echo -e "${YELLOW}🚀 Step 3: Starting dev server for runtime check...${NC}"

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for dev server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Dev server started successfully${NC}"
else
    echo -e "${RED}❌ Dev server failed to start${NC}"
    kill $DEV_PID 2>/dev/null
    exit 1
fi

# Step 4: Basic Server Response Validation
echo -e "${YELLOW}🌐 Step 4: Checking server response...${NC}"

# Basic check - server responds and serves content
if curl -s http://localhost:5173 | grep -q "kids_deliberate_practice"; then
    echo -e "${GREEN}✅ Server serving content correctly${NC}"
else
    echo -e "${RED}❌ Server not serving expected content${NC}"
    RUNTIME_ERROR=1
fi

# Cleanup
kill $DEV_PID 2>/dev/null

if [ "$RUNTIME_ERROR" = "1" ]; then
    echo -e "${RED}❌ Runtime validation failed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Basic runtime validation passed${NC}"
    echo -e "${YELLOW}💡 For full runtime error checking, use playwright browser automation${NC}"
fi

echo -e "${GREEN}🎉 All validations passed! Ready for development.${NC}"
echo -e "${YELLOW}💡 You can now run 'npm run dev' safely${NC}"