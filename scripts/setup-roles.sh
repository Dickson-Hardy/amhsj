#!/bin/bash

# =========================================================================
# AMHSJ Role Setup Script (Bash)
# =========================================================================
# Bash script to set up all academic journal roles in the database
# =========================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Configuration
DATABASE_URL=${DATABASE_URL:-""}
VERBOSE=false
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --database-url)
            DATABASE_URL="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --database-url URL    Database connection URL"
            echo "  --verbose            Show detailed output"
            echo "  --dry-run            Show what would be done without executing"
            echo "  --help               Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  DATABASE_URL         Database connection URL (if not provided via --database-url)"
            echo ""
            echo "Example:"
            echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/amhsj'"
            echo "  $0 --verbose"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}  AMHSJ Academic Journal Role Setup     ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# Check if DATABASE_URL is provided
if [[ -z "$DATABASE_URL" ]]; then
    echo -e "${RED}Error: DATABASE_URL not provided.${NC}"
    echo -e "${YELLOW}Please set the DATABASE_URL environment variable or pass it with --database-url${NC}"
    echo ""
    echo -e "${GREEN}Example usage:${NC}"
    echo -e "${GREEN}  export DATABASE_URL='postgresql://user:password@host:port/database'${NC}"
    echo -e "${GREEN}  $0 --verbose${NC}"
    echo -e "${GREEN}  $0 --database-url 'postgresql://user:password@host:port/database'${NC}"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL psql command not found.${NC}"
    echo -e "${YELLOW}Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_SCRIPT="$SCRIPT_DIR/setup-roles.sql"

# Check if SQL script exists
if [[ ! -f "$SQL_SCRIPT" ]]; then
    echo -e "${RED}Error: SQL script not found at: $SQL_SCRIPT${NC}"
    exit 1
fi

# Hide password in display URL
DISPLAY_URL=$(echo "$DATABASE_URL" | sed 's/postgresql:\/\/[^@]*@/postgresql:\/\/***@/')

echo -e "${YELLOW}Configuration:${NC}"
echo -e "${GRAY}  Database URL: $DISPLAY_URL${NC}"
echo -e "${GRAY}  SQL Script: $SQL_SCRIPT${NC}"
echo -e "${GRAY}  Dry Run: $DRY_RUN${NC}"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made to the database${NC}"
    echo ""
    echo -e "${CYAN}SQL Script Contents Preview:${NC}"
    head -50 "$SQL_SCRIPT" | while IFS= read -r line; do
        echo -e "${GRAY}  $line${NC}"
    done
    echo -e "${GRAY}  ... (script continues)${NC}"
    echo ""
    echo -e "${GREEN}To execute for real, run without --dry-run flag${NC}"
    exit 0
fi

# Confirm execution
echo -e "${YELLOW}This will create all academic journal roles and sample data in your database.${NC}"
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Executing role setup...${NC}"

# Build psql arguments
PSQL_ARGS=("$DATABASE_URL" -f "$SQL_SCRIPT" -v ON_ERROR_STOP=1)

if [[ "$VERBOSE" == "true" ]]; then
    PSQL_ARGS+=(-a)  # Echo all input
else
    PSQL_ARGS+=(-q)  # Quiet mode
fi

echo -e "${GRAY}Running: psql [DATABASE_URL] -f $SQL_SCRIPT${NC}"
echo ""

# Execute the SQL script
if psql "${PSQL_ARGS[@]}"; then
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}         SETUP COMPLETED SUCCESSFULLY    ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${CYAN}Roles created:${NC}"
    echo -e "${GREEN}  ✓ System Administrator (admin)${NC}"
    echo -e "${GREEN}  ✓ Editor-in-Chief (editor-in-chief)${NC}"
    echo -e "${GREEN}  ✓ Managing Editor (managing-editor)${NC}"
    echo -e "${GREEN}  ✓ Section Editors (section-editor)${NC}"
    echo -e "${GREEN}  ✓ Production Editor (production-editor)${NC}"
    echo -e "${GREEN}  ✓ Guest Editor (guest-editor)${NC}"
    echo -e "${GREEN}  ✓ Associate Editors (editor)${NC}"
    echo -e "${GREEN}  ✓ Peer Reviewers (reviewer)${NC}"
    echo -e "${GREEN}  ✓ Authors (author)${NC}"
    echo ""
    echo -e "${CYAN}Sample login credentials:${NC}"
    echo -e "${YELLOW}  Admin: admin@amhsj.org / password123${NC}"
    echo -e "${YELLOW}  EIC: eic@amhsj.org / password123${NC}"
    echo -e "${YELLOW}  Managing: managing@amhsj.org / password123${NC}"
    echo ""
    echo -e "${RED}Note: Change default passwords in production!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. Start your application: npm run dev"
    echo -e "  2. Login with any of the above credentials"
    echo -e "  3. Test the role-based workflows"
    echo ""
else
    echo ""
    echo -e "${RED}Error: Setup failed with exit code $?${NC}"
    echo -e "${YELLOW}Check the error messages above for details.${NC}"
    exit 1
fi

# Optional: Run verification queries
echo ""
read -p "Would you like to run verification queries to check the setup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}Running verification queries...${NC}"
    
    cat << 'EOF' | psql "$DATABASE_URL"
-- Role Summary
SELECT 'ROLE SUMMARY' as report_type, '' as details
UNION ALL
SELECT role, COUNT(*)::text || ' users' as details
FROM users 
GROUP BY role 
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'editor-in-chief' THEN 2
        WHEN 'managing-editor' THEN 3
        WHEN 'section-editor' THEN 4
        WHEN 'production-editor' THEN 5
        WHEN 'guest-editor' THEN 6
        WHEN 'editor' THEN 7
        WHEN 'reviewer' THEN 8
        WHEN 'author' THEN 9
        ELSE 10
    END;
EOF
    
    echo ""
    echo -e "${GREEN}Verification complete!${NC}"
fi

echo ""
echo -e "${GREEN}Role setup script completed successfully!${NC}"
