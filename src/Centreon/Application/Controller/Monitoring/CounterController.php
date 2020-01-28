<?php

/*
 * Copyright 2005 - 2020 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */
declare(strict_types=1);

namespace Centreon\Application\Controller\Monitoring;

use Centreon\Domain\Monitoring\Interfaces\CounterServiceInterface;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\View\View;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use FOS\RestBundle\Controller\Annotations as Rest;

/**
 * @package Centreon\Application\Controller
 */
class CounterController extends AbstractFOSRestController
{
    /**
     * @var CounterServiceInterface
     */
    private $counterService;

    /**
     * CounterController constructor.
     *
     * @param CounterServiceInterface $counterService
     */
    public function __construct(CounterServiceInterface $counterService)
    {
        $this->counterService = $counterService;
    }

    /**
     * Entry point to get count of real time hosts by status.
     *
     * @IsGranted("ROLE_API_REALTIME", message="You are not authorized to access this resource")
     * @Rest\Get(
     *     "/monitoring/counter/hosts",
     *     condition="request.attributes.get('version.is_beta') == true")
     *
     * @return View
     * @throws \Exception
     */
    public function countHosts()
    {
        $hostCounter = $this->counterService
            ->filterByContact($this->getUser())
            ->countHosts();

        $hosts = [
            'down' => [
                'total' => $hostCounter->getDownTotal(),
                'unhandled' => $hostCounter->getDownUnhandled(),
            ],
            'unreachable' => [
                'total' => $hostCounter->getUnreachableTotal(),
                'unhandled' => $hostCounter->getUnreachableUnhandled(),
            ],
            'up' => $hostCounter->getUp(),
            'pending' => $hostCounter->getPending(),
            'total' => $hostCounter->getTotal(),
        ];

        return $this->view($hosts);
    }
}
