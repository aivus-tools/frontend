export const GuidanceDictionary = {
	estimationTemplate: {
		label: 'Estimation Template',
		header: '',
		description:
			'If you’ve saved templates before, you can use one here to speed things up. Perfect for repeat projects or similar scopes—no need to reinvent the wheel every time.',
	},
	projectDescription: {
		label: 'Project Description',
		header: '',
		description: (
			<>
				Give more details about your project (Objectives, Audience, Tone and Style, Key Messages, Preferred Deadline)
				<br />
				This is the core of your project. The more details you give, the more accurate the pricing and the better the
				final result. Here’s what to include: • What’s the goal? Is it an ad, an explainer, a social media video? •
				Who’s watching? Target audience—age, interests, where they’ll see it. • What’s the vibe? Fun and energetic,
				serious and corporate, cinematic, animated? • Key messages—what do you need to say? • Deadline—when do you need
				this done? 📌 Tip: More details = fewer back-and-forth questions + faster, more accurate cost estimates.
			</>
		),
	},
	referenceVideos: {
		label: 'Reference Videos URL',
		header: '',
		description: (
			<>
				Add links to relevant videos.
				<br />
				Drop a link to a video that looks or feels like what you want. Could be: • Something your company made before •
				A competitor’s ad • A random video you found that has the right style 🎯 Why this matters: Video references
				explain your vision way better than words. They show the style, effects, pacing, and overall feel you like. ⚠️
				Warning: Don’t pick a super high-end commercial unless you’re ready to pay for that quality. If you link to a
				$500K production, vendors will assume you want the same and price it accordingly. Pick something that actually
				fits your budget and expectations.
			</>
		),
	},
	budget: {
		label: 'Budget',
		header: '',
		description: 'What is your budget for this project?',
	},
	clientName: {
		label: 'Client Name',
		header: '',
		description: (
			<>
				A name of the client is required and recommended to be unique.
				<br />
				Use the official company name, like “Meta Platforms, Inc.” This keeps your projects organized and makes it
				easier to track all work with this client. Plus, it helps in analytics—so later, you can see if working with
				this client is worth it.
			</>
		),
	},
	irsEin: {
		label: 'IRS EIN',
		header: '',
		description: (
			<>
				Taxpayer Id
				<br />
				Adding the client’s IRS EIN makes project management even smoother. It helps link their profile to your
				projects, ensuring all client details stay up to date automatically. If the company changes names or has other
				updates, you’ll know. Also, your analytics will be sharper.
			</>
		),
	},
	brandName: {
		label: 'Brand Name',
		header: '',
		description: (
			<>
				Specify the specific brand within your company, if needed.
				<br />
				Some companies have multiple brands. Specify which one this project is for—like Facebook instead of Meta. Keeps
				things crystal clear.
			</>
		),
	},
	manager: {
		label: 'Manager',
		header: '',
		description: (
			<>
				Indicate the project managers responsible.
				<br />
				If the client hasn’t provided a contact person, add one yourself. Filling this out properly helps your AI
				production assistant communicate effectively with the right people later.
			</>
		),
	},
	manager_position: {
		label: 'Manager Position',
		header: '',
		description:
			'This is the job title of the client’s contact person—like Marketing Manager or CMO. Knowing this helps you build the right structure and direct questions to the right decision-makers.',
	},
	crmId: {
		label: 'CRM ID',
		header: '',
		description: 'Set your own ID if applicable. (CRM ID | Link)',
	},
	projectName: {
		label: 'Project Name',
		header: '',
		description: (
			<>
				A project name is required and recommended to be unique.
				<br />
				This is the name that both the client and vendors will see. Make it short, clear, and easy to recognize. Think
				of it as a movie title—it should capture the essence of the project at a glance.
			</>
		),
	},
	description: {
		label: 'Description',
		header: '',
		description: (
			<>
				Set a description to the project if needed. Visible by your team only.
				<br />
				An internal note for your team. You can add any extra details that help clarify the project’s scope, goals, or
				quirks. If you’re the client, vendors won’t see this. If you’re a vendor, the client won’t see it either. It’s
				your private space for notes.
			</>
		),
	},
	collaborators: {
		label: 'Collaborators',
		header: '',
		description: (
			<>
				<b>Add internal managers.</b> They can only view the projects they are invited to and have access to client
				pricing and profit details.
				<br />
				These are your team members or external partners who’ll help run the project. You can add anyone from your crew,
				but until you do, they won’t see this project. Only admins have full visibility by default. Two types of
				collaborators: • Internal – Your in-house team (e.g., project managers, executive producers). They can see
				everything, including client pricing and profit margins. • External – Freelancers or hired specialists (e.g.,
				line producers). They only see the internal budget—never client pricing or project profits. Their job is to
				track what’s actually spent, not what’s earned.
			</>
		),
	},
	distributionAndAdPlacements: {
		label: 'Distribution and Ad Placements',
		header: '',
		description: 'Select at least one placement for your ad',
	},
	territory: {
		label: 'Territory',
		header: '',
		description: 'Select all country/regions you need or “Worldwide”',
	},
	term_length: {
		label: 'Term Length',
		header: '',
		description: 'Set the period or Perpetuity',
	},
	term_unit: {
		label: 'Term Unit',
		header: '',
		description: 'Set the period or Perpetuity',
	},
	mainVideoDuration: {
		label: 'Main Video Duration',
		header: '',
		description: 'Number and length of original videos.',
	},
	cuts: {
		label: 'Cuts',
		header: '',
		description: 'Number of cuts',
	},
	shootingDays: {
		label: 'Shooting Days',
		header: '',
		description: 'Number of shooting days',
	},
};
