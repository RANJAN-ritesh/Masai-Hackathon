#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the MyTeam.jsx file
const filePath = path.join(__dirname, 'Frontend/src/components/MyTeam.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the participant team mode section and replace it
const startMarker = '        {/* Participant Team Mode */}';
const endMarker = '        )}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const beforeSection = content.substring(0, startIndex);
  const afterSection = content.substring(endIndex + endMarker.length);
  
  const newSection = `        {/* Participant Team Mode */}
        {isParticipantTeamMode && (
          <ParticipantTeamMode 
            hackathon={hackathon}
            userId={userId}
            baseURL={baseURL}
          />
        )}`;
  
  const newContent = beforeSection + newSection + afterSection;
  
  // Write the updated content back
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log('✅ Successfully updated MyTeam.jsx to use ParticipantTeamMode component');
} else {
  console.log('❌ Could not find the participant team mode section to replace');
}
