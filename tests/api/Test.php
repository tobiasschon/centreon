<?php

namespace App\Tests\Api;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\BrowserKit\AbstractBrowser;
use Symfony\Component\DependencyInjection\Exception\ServiceNotFoundException;
use Symfony\Component\HttpClient\HttpClientTrait;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpFoundation\Test\Constraint as ResponseConstraint;
//use Symfony\Bundle\FrameworkBundle\Test\BrowserKitAssertionsTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class Test extends WebTestCase
{
    public function testGetCollection(): void
    {
        $client = static::createClient(['base_uri' => 'http://127.0.0.1']);
        //var_dump($client);
        $response = $client->request('POST', 'api/beta/login');
        $this->assertResponseIsSuccessful();
        //self::assertThat($response, new ResponseConstraint\ResponseIsSuccessful());
        //var_dump($response);

        //$client->request('GET', '/books');



        //$this->assertResponseIsSuccessful();
        //$this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }
}