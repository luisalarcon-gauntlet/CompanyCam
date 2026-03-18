puts "Seeding FieldCheck demo data..."

# Checklist Templates
templates_data = [
  {
    name: "Roofing Inspection",
    trade_type: "roofing",
    is_default: true,
    items: [
      { title: "Remove old shingles", position: 1 },
      { title: "Inspect roof deck for damage", position: 2 },
      { title: "Install ice & water shield", position: 3 },
      { title: "Install drip edge", position: 4 },
      { title: "Lay felt paper / underlayment", position: 5 },
      { title: "Install shingles", position: 6 },
      { title: "Flash chimney and vents", position: 7 },
      { title: "Install ridge cap", position: 8 },
      { title: "Clean gutters", position: 9 },
      { title: "Final inspection photo", position: 10 }
    ]
  },
  {
    name: "HVAC Service Checklist",
    trade_type: "hvac",
    is_default: true,
    items: [
      { title: "Check thermostat settings", position: 1 },
      { title: "Inspect air filter", position: 2 },
      { title: "Test heating cycle", position: 3 },
      { title: "Test cooling cycle", position: 4 },
      { title: "Check refrigerant levels", position: 5 },
      { title: "Inspect ductwork for leaks", position: 6 },
      { title: "Clean condenser coils", position: 7 },
      { title: "Take before photo", position: 8 },
      { title: "Take after photo", position: 9 }
    ]
  },
  {
    name: "Plumbing Inspection",
    trade_type: "plumbing",
    is_default: true,
    items: [
      { title: "Shut off water main", position: 1 },
      { title: "Inspect existing pipes", position: 2 },
      { title: "Check for active leaks", position: 3 },
      { title: "Install new fixture", position: 4 },
      { title: "Test for leaks at all connections", position: 5 },
      { title: "Restore water pressure", position: 6 },
      { title: "Test drain flow", position: 7 },
      { title: "Take completion photo", position: 8 }
    ]
  },
  {
    name: "Electrical Panel Upgrade",
    trade_type: "electrical",
    is_default: true,
    items: [
      { title: "Photograph existing panel", position: 1 },
      { title: "Label all breakers", position: 2 },
      { title: "Install new circuit", position: 3 },
      { title: "Test all outlets", position: 4 },
      { title: "Test GFCI outlets", position: 5 },
      { title: "Final inspection photo", position: 6 }
    ]
  },
  {
    name: "General Site Walkthrough",
    trade_type: "general",
    is_default: true,
    items: [
      { title: "Site walkthrough complete", position: 1 },
      { title: "Safety check passed", position: 2 },
      { title: "Material delivery confirmed", position: 3 },
      { title: "Work complete photo", position: 4 },
      { title: "Customer sign-off", position: 5 }
    ]
  },
  {
    name: "Painting Prep & Finish",
    trade_type: "painting",
    is_default: true,
    items: [
      { title: "Surface prep — sand and clean", position: 1 },
      { title: "Apply primer coat", position: 2 },
      { title: "Tape edges and trim", position: 3 },
      { title: "Apply first paint coat", position: 4 },
      { title: "Apply second paint coat", position: 5 },
      { title: "Remove tape and clean up", position: 6 },
      { title: "Touch up any missed spots", position: 7 },
      { title: "Completion photo", position: 8 }
    ]
  },
  {
    name: "Landscaping Job",
    trade_type: "landscaping",
    is_default: true,
    items: [
      { title: "Site assessment complete", position: 1 },
      { title: "Equipment check", position: 2 },
      { title: "Mow and edge lawn", position: 3 },
      { title: "Trim shrubs and bushes", position: 4 },
      { title: "Remove debris and clippings", position: 5 },
      { title: "Apply fertilizer or treatment", position: 6 },
      { title: "Check irrigation system", position: 7 },
      { title: "Job completion photo", position: 8 }
    ]
  }
]

puts "Creating checklist templates..."
templates_data.each do |data|
  ChecklistTemplate.find_or_create_by!(name: data[:name], trade_type: data[:trade_type]) do |t|
    t.is_default = data[:is_default]
    t.items = data[:items]
  end
end
puts "  Created #{ChecklistTemplate.count} templates"

# Demo Users
puts "Creating demo users..."

demo_user = User.find_or_create_by!(email: "demo@fieldcheck.app") do |record|
  record.name = "Demo Contractor"
  record.password = "password123"
  record.password_confirmation = "password123"
  record.role = "owner"
end
puts "  Owner:     demo@fieldcheck.app / password123"

crew_user = User.find_or_create_by!(email: "crew@fieldcheck.app") do |record|
  record.name = "Alex Rivera"
  record.password = "password123"
  record.password_confirmation = "password123"
  record.role = "crew_lead"
end
puts "  Crew Lead: crew@fieldcheck.app / password123"

tech_user = User.find_or_create_by!(email: "tech@fieldcheck.app") do |record|
  record.name = "Jordan Kim"
  record.password = "password123"
  record.password_confirmation = "password123"
  record.role = "tech"
end
puts "  Tech:      tech@fieldcheck.app / password123"

# Clear existing demo projects for clean re-seed
demo_user.projects.destroy_all

# ──────────────────────────────────────────────
# PROJECT 1: Nearly complete (8/9 items done)
# Story: Almost done, one item left — creates urgency
# ──────────────────────────────────────────────
puts "Creating Roofing project (nearly complete)..."
roofing_project = Project.find_or_create_by!(name: "Harmon Residence — Roof Replacement") do |record|
  record.user = demo_user
  record.address = "1842 Oak Street, Austin, TX 78701"
  record.trade_type = "roofing"
  record.notes = "Full tear-off and replacement. Homeowner requested architectural shingles. GAF Timberline HDZ in Charcoal."
end

roofing_cl1 = Checklist.find_or_create_by!(name: "Tear Off & Prep", project_id: roofing_project.id) do |record|
  record.position = 1
end

[
  { title: "Remove old shingles",            status: "complete", completed_at: 2.days.ago, completed_via: "manual" },
  { title: "Inspect roof deck for damage",   status: "complete", completed_at: 2.days.ago, completed_via: "voice",
    voice_transcription: "Finished inspecting the deck, looks good no damage found",
    ai_confidence: 0.91 },
  { title: "Install ice & water shield",     status: "complete", completed_at: 2.days.ago, completed_via: "manual" },
  { title: "Install drip edge",              status: "complete", completed_at: 1.day.ago, completed_via: "voice",
    voice_transcription: "Just wrapped up the drip edge on all four sides",
    ai_confidence: 0.95 },
  { title: "Lay felt paper / underlayment",  status: "complete", completed_at: 1.day.ago, completed_via: "photo",
    photo_url: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800",
    photo_thumbnail_url: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=200",
    ai_confidence: 0.87 },
].each_with_index do |attrs, i|
  ChecklistItem.find_or_create_by!(title: attrs[:title], checklist_id: roofing_cl1.id) do |record|
    record.status = attrs[:status]
    record.position = i + 1
    record.completed_at = attrs[:completed_at]
    record.completed_via = attrs[:completed_via]
    record.completed_by = attrs[:status] == "complete" ? demo_user : nil
    record.voice_transcription = attrs[:voice_transcription]
    record.photo_url = attrs[:photo_url]
    record.photo_thumbnail_url = attrs[:photo_thumbnail_url]
    record.ai_confidence = attrs[:ai_confidence]
  end
end

roofing_cl2 = Checklist.find_or_create_by!(name: "Install & Finish", project_id: roofing_project.id) do |record|
  record.position = 2
end

[
  { title: "Install shingles",               status: "complete", completed_at: 4.hours.ago, completed_via: "photo",
    photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    photo_thumbnail_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    ai_confidence: 0.88 },
  { title: "Flash chimney and vents",        status: "complete", completed_at: 3.hours.ago, completed_via: "manual" },
  { title: "Install ridge cap",              status: "complete", completed_at: 2.hours.ago, completed_via: "voice",
    voice_transcription: "Ridge cap is done, looks clean all the way across",
    ai_confidence: 0.92 },
  { title: "Final inspection photo",         status: "incomplete" },
].each_with_index do |attrs, i|
  ChecklistItem.find_or_create_by!(title: attrs[:title], checklist_id: roofing_cl2.id) do |record|
    record.status = attrs[:status]
    record.position = i + 1
    record.completed_at = attrs[:completed_at]
    record.completed_via = attrs[:completed_via]
    record.completed_by = attrs[:status] == "complete" ? demo_user : nil
    record.voice_transcription = attrs[:voice_transcription]
    record.photo_url = attrs[:photo_url]
    record.photo_thumbnail_url = attrs[:photo_thumbnail_url]
    record.ai_confidence = attrs[:ai_confidence]
  end
end

# ──────────────────────────────────────────────
# PROJECT 2: Mid-job (4/8 items done)
# Story: In progress, mix of completion methods
# ──────────────────────────────────────────────
puts "Creating HVAC project (mid-job)..."
hvac_project = Project.find_or_create_by!(name: "Mueller HVAC Install") do |record|
  record.user = demo_user
  record.address = "4200 Commerce Dr, Suite 310, Austin, TX 78744"
  record.trade_type = "hvac"
  record.notes = "New Carrier Infinity 24 system. Replacing a 12-year-old Trane unit. Customer wants smart thermostat integration."
end

hvac_cl1 = Checklist.find_or_create_by!(name: "System Inspection", project_id: hvac_project.id) do |record|
  record.position = 1
end

[
  { title: "Check thermostat settings",       status: "complete", completed_at: 5.hours.ago, completed_via: "manual" },
  { title: "Inspect air filter",              status: "complete", completed_at: 5.hours.ago, completed_via: "voice",
    voice_transcription: "Filter is dirty, replacing it now with a MERV 13",
    ai_confidence: 0.78 },
  { title: "Test heating cycle",             status: "complete", completed_at: 4.hours.ago, completed_via: "manual" },
  { title: "Test cooling cycle",             status: "complete", completed_at: 4.hours.ago, completed_via: "manual" },
  { title: "Check refrigerant levels",       status: "incomplete" },
  { title: "Inspect ductwork for leaks",     status: "incomplete" },
].each_with_index do |attrs, i|
  ChecklistItem.find_or_create_by!(title: attrs[:title], checklist_id: hvac_cl1.id) do |record|
    record.status = attrs[:status]
    record.position = i + 1
    record.completed_at = attrs[:completed_at]
    record.completed_via = attrs[:completed_via]
    record.completed_by = attrs[:status] == "complete" ? demo_user : nil
    record.voice_transcription = attrs[:voice_transcription]
    record.ai_confidence = attrs[:ai_confidence]
  end
end

hvac_cl2 = Checklist.find_or_create_by!(name: "Documentation", project_id: hvac_project.id) do |record|
  record.position = 2
end

[
  { title: "Take before photo",              status: "complete", completed_at: 6.hours.ago, completed_via: "photo",
    photo_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    photo_thumbnail_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200",
    ai_confidence: 0.82 },
  { title: "Take after photo",              status: "incomplete" },
].each_with_index do |attrs, i|
  ChecklistItem.find_or_create_by!(title: attrs[:title], checklist_id: hvac_cl2.id) do |record|
    record.status = attrs[:status]
    record.position = i + 1
    record.completed_at = attrs[:completed_at]
    record.completed_via = attrs[:completed_via]
    record.completed_by = attrs[:status] == "complete" ? demo_user : nil
    record.photo_url = attrs[:photo_url]
    record.photo_thumbnail_url = attrs[:photo_thumbnail_url]
    record.ai_confidence = attrs[:ai_confidence]
  end
end

# ──────────────────────────────────────────────
# PROJECT 3: Just started (1/7 items done)
# Story: Fresh job, barely begun — shows the starting point
# ──────────────────────────────────────────────
puts "Creating Plumbing project (just started)..."
plumbing_project = Project.find_or_create_by!(name: "Westside Plumbing Inspection") do |record|
  record.user = demo_user
  record.address = "756 Maple Ave, Austin, TX 78703"
  record.trade_type = "plumbing"
  record.notes = "Full property inspection before closing. Check all fixtures, water heater, main line."
end

plumbing_cl1 = Checklist.find_or_create_by!(name: "Property Inspection", project_id: plumbing_project.id) do |record|
  record.position = 1
end

[
  { title: "Shut off water main",            status: "complete", completed_at: 1.hour.ago, completed_via: "manual" },
  { title: "Inspect existing pipes",         status: "incomplete" },
  { title: "Check for active leaks",         status: "incomplete" },
  { title: "Test water heater",              status: "incomplete" },
  { title: "Inspect all fixtures",           status: "incomplete" },
  { title: "Test drain flow",               status: "incomplete" },
  { title: "Take completion photo",         status: "incomplete" },
].each_with_index do |attrs, i|
  ChecklistItem.find_or_create_by!(title: attrs[:title], checklist_id: plumbing_cl1.id) do |record|
    record.status = attrs[:status]
    record.position = i + 1
    record.completed_at = attrs[:completed_at]
    record.completed_via = attrs[:completed_via]
    record.completed_by = attrs[:status] == "complete" ? demo_user : nil
  end
end

puts "\nSeed complete!"
puts "  Users: #{User.count}"
puts "  Projects: #{Project.count}"
puts "  Checklists: #{Checklist.count}"
puts "  Items: #{ChecklistItem.count}"
puts "  Templates: #{ChecklistTemplate.count}"
puts ""
puts "  Harmon Residence: 8/9 items (nearly complete)"
puts "  Mueller HVAC: 5/8 items (mid-job)"
puts "  Westside Plumbing: 1/7 items (just started)"
