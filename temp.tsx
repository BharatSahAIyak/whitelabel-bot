// import { useRouter } from 'next/router'

export default function Page() {
    // const router = useRouter()

    return (
        <>
            <div className='max-w-[1700px] mx-auto'>
                <h1 className='text-3xl md:text-4xl text-center p-2 mt-4 font-bold'>
                    Programmes Offered
                </h1>
                <br />
                <h2 className='p-2 mb-1 text-lg md:text-2xl lin-h text-center tracking-tighter'>
                    The Department Offers following undergraduation,
                    postgraduation and Research Programmes:
                </h2>
            </div>

            <div className=' flex justify-center  p-2  border-1 rounded  '>
                {/* <div className="flex items-center justify-between my-2 px-2"> */}
                <div className='flex flex-col gap-2 w-3/4 justify-center items-center text-center w-400 h-300 '>
                    <div className='flex flex-wrap shadow-md justify-center items-center  p-4'>
                        <h1 className='text-xl text-red-800 font-bold'>
                            B.tech in Computer Science and Engineering
                        </h1>
                        <p className='py-2 text-justify'>
                            B.tech in Computer Science and Engineering is a
                            4-year undergraduation programme.The course
                            curriculum of Bachelor programme is designed to
                            include components like theory and practical course
                            works, seminars and projects, through which a
                            student can develop his/her concepts and
                            intellectual skills.{' '}
                        </p>
                    </div>

                    <div className='flex flex-wrap shadow-md justify-center items-center  p-4 '>
                        <h1 className='text-xl text-red-800 font-bold'>
                            Dual-Degree in Computer Science and Engineering
                        </h1>
                        <p className='py-2 text-justify'>
                            Dual-Degree in Computer Science and Engineering is a
                            5-year Integrated B.tech and M.tech programme.The
                            course curriculum ofthis programme is designed to
                            include components like theory and practical course
                            works, seminars and projects.Along with these
                            students will be able to study Postgraduation
                            subjects which will enhance their knowledge about
                            subjects and they will be able to do research{' '}
                        </p>
                    </div>

                    <div className='flex flex-wrap shadow-md justify-center items-center p-4 '>
                        <h1 className='text-xl text-red-800 font-bold'>
                            M.tech in Computer Science and Engineering{' '}
                        </h1>
                        <ul className='py-4 list-disc list-inside rounded '>
                            <li className=' text-red-800 font-semibold tracking-tighter'>
                                <span className='text-lg'>
                                    M.Tech in Computer Science & Engineering{' '}
                                </span>
                                <p className=' text-black py-1 font-normal text-justify'>
                                    M.tech in Computer Science and Engineering
                                    is a 2 year postgraduate programme.The
                                    program provides a solid foundation in
                                    theoretical concepts, algorithms, data
                                    structures, and software development.
                                    Students gain expertise in areas like Cloud
                                    Computing, Data Analytics, Artificial
                                    Intelligence, and Database Management
                                    Techniques.
                                </p>
                            </li>

                            <li className='  text-red-800 font-semibold py-3 tracking-tighter'>
                                <span className='text-lg'>
                                    M.tech in Computer Science and Engineering
                                    (Artificial Intelligence)
                                </span>
                                <p className=' text-black py-1 font-normal text-justify'>
                                    {' '}
                                    This program aims to enhance students&apos;
                                    technical skills and expertise in
                                    implementing and deploying AI solutions for
                                    real-world applications.Graduates will
                                    comprehend the theoretical foundations of
                                    computing and the modeling and design of
                                    Artificial Intelligence (AI) systems.
                                </p>
                            </li>
                        </ul>
                    </div>
                    <div className='flex flex-wrap shadow-md justify-center items-center  p-4 '>
                        <h1 className='text-xl text-red-800 font-bold mx-2'>
                            Doctoral Programs in Computer Science and
                            Engineering
                        </h1>
                        <p className='text-justify'>
                            A doctoral program in Computer Science and
                            Engineering (CSE) aims to provide advanced education
                            and research opportunities to students interested in
                            pursuing careers in academia, industry research, or
                            leadership positions in technology. The objectives
                            of such a program typically include:
                            <span className='font-semibold'>
                                Advanced Research Skills, Specialization in
                                domain, Critical Thinking and Problem-Solving,
                                Publication and Dissemination, Leadership and
                                Collaboration, Teaching and Mentoring.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
