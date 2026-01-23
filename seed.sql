-- seed.sql
-- Populate Projects
INSERT INTO Projects (id, title, description, longDescription, tags, imageUrl, category, demoUrl, githubUrl, features, gallery, role, year) VALUES 
('1', 'E-Commerce Dashboard', 'A comprehensive analytics dashboard for online retailers with real-time data visualization.', 'This project addresses the complex needs of modern online retailers by providing a centralized hub for all business operations. The dashboard aggregates data from multiple sales channels, providing real-time insights into inventory levels, sales performance, and customer behavior. We focused heavily on performance optimization to handle large datasets without compromising user experience.', '["React", "TypeScript", "Tailwind", "Recharts"]', 'https://picsum.photos/800/600?random=1', 'Web', '#', '#', '["Real-time WebSocket data updates", "Interactive data visualization with Recharts", "Role-based access control (RBAC)", "Automated inventory forecasting"]', '["https://picsum.photos/800/600?random=101", "https://picsum.photos/800/600?random=102", "https://picsum.photos/800/600?random=103"]', 'Lead Frontend Developer', '2023'),
('2', 'FinTech Mobile App', 'Secure and intuitive mobile banking application built with React Native.', 'A next-generation mobile banking solution designed to simplify personal finance management. The app features biometric authentication, instant peer-to-peer transfers, and AI-powered spending insights. Security was paramount, implementing end-to-end encryption and secure enclave storage for sensitive data.', '["React Native", "Node.js", "PostgreSQL"]', 'https://picsum.photos/800/600?random=2', 'Mobile', '#', '#', '["Biometric Login (FaceID / TouchID)", "Real-time transaction notifications", "Spending categorization via ML", "Offline mode support"]', '["https://picsum.photos/800/600?random=201", "https://picsum.photos/800/600?random=202"]', 'Full Stack Developer', '2022'),
('3', 'AI Content Generator', 'SaaS platform leveraging Gemini API for automated blog post generation.', 'An innovative SaaS platform that empowers content creators to generate high-quality blog posts, social media captions, and marketing copy in seconds. Leveraging the Google Gemini API, the system understands context and tone, delivering human-like content that requires minimal editing.', '["Next.js", "Gemini API", "Stripe"]', 'https://picsum.photos/800/600?random=3', 'Web', '#', '#', '["Context-aware text generation", "Multi-tone support (Professional, Casual, Witty)", "SEO optimization suggestions", "One-click export to CMS"]', '["https://picsum.photos/800/600?random=301", "https://picsum.photos/800/600?random=302", "https://picsum.photos/800/600?random=303"]', 'Solo Founder', '2024'),
('4', 'Open Source UI Kit', 'A collection of accessible and reusable React components.', 'A modern, accessible, and lightweight UI component library built for React applications. The goal was to provide a set of components that are easy to style, fully accessible (WAI-ARIA compliant), and performant. It includes a robust theming system based on CSS variables.', '["React", "Storybook", "NPM"]', 'https://picsum.photos/800/600?random=4', 'Open Source', '#', '#', '["WAI-ARIA Compliant", "Headless component architecture", "Built-in dark mode support", "Comprehensive documentation with Storybook"]', '["https://picsum.photos/800/600?random=401"]', 'Maintainer', '2021');

-- Populate Skills
INSERT INTO Skills (name, icon, description, category, level) VALUES 
('React', '⚛️', 'Advanced patterns & Performance', 'Frontend', 95),
('TypeScript', '📘', 'Strict typing & Generics', 'Frontend', 90),
('Node.js', '🟢', 'Microservices architecture', 'Backend', 85),
('Next.js', '▲', 'SSR/RSC & App Router', 'Frontend', 92),
('Docker', '🐳', 'Containerization flow', 'DevOps', 75),
('AWS', '☁️', 'EC2, S3, Lambda, RDS', 'DevOps', 70),
('PostgreSQL', '🐘', 'Complex queries & Optimization', 'Backend', 80),
('Figma', '🎨', 'Design systems & Prototyping', 'Tools', 65);

-- Populate BlogPosts
INSERT INTO BlogPosts (id, title, excerpt, content, date, readTime, imageUrl, category) VALUES 
('1', 'The Future of React: Server Components', 'Exploring how RSC changes the paradigm of frontend development and performance optimization.', 'React Server Components (RSC) represent one of the most significant architectural shifts in the React ecosystem since hooks. They allow developers to write components that run exclusively on the server, reducing the amount of JavaScript sent to the client and enabling direct access to backend resources.', 'Oct 12, 2023', '5 min read', 'https://picsum.photos/600/350?random=10', 'Tech'),
('2', 'Mastering Tailwind CSS', 'Best practices for scalable and maintainable utility-first CSS architectures.', '', 'Nov 05, 2023', '7 min read', 'https://picsum.photos/600/350?random=11', 'Design'),
('3', 'From Junior to Senior Developer', 'My journey and key lessons learned over 5 years in the tech industry.', '', 'Dec 01, 2023', '10 min read', 'https://picsum.photos/600/350?random=12', 'Career');

-- Populate Experiences
INSERT INTO Experiences (company, position, period, description, logo) VALUES 
('TechCorp Solutions', 'Senior Frontend Engineer', '2021 - Present', '["Led the migration of legacy monolith to micro-frontend architecture.", "Improved core web vitals by 40%.", "Mentored junior developers and established code review standards."]', NULL),
('Creative Agency', 'Full Stack Developer', '2019 - 2021', '["Developed 20+ client websites using JAMstack technologies.", "Integrated headless CMS solutions for non-technical content editors.", "Collaborated closely with design team to implement pixel-perfect UIs."]', NULL);

-- Populate Settings
INSERT INTO Settings (key, value) VALUES 
('profile', '{"name": "John Doe", "role": "Full Stack Engineer", "email": "hello@johndoe.dev", "location": "Istanbul, Turkey", "availability": "Available for Freelance Projects", "about": ["Hello! I''m John, a passionate developer based in Istanbul, Turkey. My journey began 5 years ago when I decided to turn my curiosity for how the web works into a career.", "I specialize in building accessible, inclusive, and performant web experiences. I enjoy solving complex problems and turning difficult concepts into simple, user-friendly interfaces.", "When I''m not coding, you can find me hiking in the mountains, brewing specialty coffee, or contributing to open-source projects."], "yearsOfExperience": "5+", "completedProjects": "50+", "profileImage": "https://picsum.photos/800/1000?grayscale"}');
